// =====================================================
// Stripe Webhook Handler with User Provisioning
// =====================================================
// Handles subscription lifecycle events and provisions users
// Implements: signature verification, idempotency, user creation

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Admin Client (service role)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// =====================================================
// PRICE ID TO PLAN MAPPING
// =====================================================
const PRICE_TO_PLAN = {
  'price_1SjMSiL4MuRaMM4CHYCyQf6F': 'basic',  // Basic Monthly
  'price_1SjMSiL4MuRaMM4CLhZnK7UJ': 'basic',  // Basic Yearly
  'price_1SjMTOL4MuRaMM4C209NcRgl': 'pro',    // Pro Monthly
  'price_1SjMTOL4MuRaMM4CPbRJ5O86': 'pro'     // Pro Yearly
};

// =====================================================
// IDEMPOTENCY: Check if event already processed
// =====================================================
async function isEventProcessed(eventId) {
  const { data, error } = await supabase
    .from('stripe_events')
    .select('event_id')
    .eq('event_id', eventId)
    .single();
  
  return data !== null;
}

// =====================================================
// IDEMPOTENCY: Mark event as processed
// =====================================================
async function markEventProcessed(eventId, eventType, payload = null) {
  const { error } = await supabase
    .from('stripe_events')
    .insert({
      event_id: eventId,
      type: eventType,
      payload: payload
    });
  
  if (error && error.code !== '23505') { // Ignore duplicate key errors
    console.error('Failed to mark event as processed:', error);
  }
}

// =====================================================
// USER PROVISIONING: Find or create Supabase user
// =====================================================
async function provisionUser(email) {
  try {
    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      throw listError;
    }
    
    const existingUser = existingUsers.users.find(u => u.email === email);
    
    if (existingUser) {
      console.log(`User already exists: ${email} (${existingUser.id})`);
      return existingUser.id;
    }
    
    // Create new user with email invite
    const shouldSendInvite = process.env.SEND_INVITE !== 'false'; // Default true
    
    const { data: newUser, error: createError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          provisioned_via: 'stripe_webhook',
          provisioned_at: new Date().toISOString()
        },
        redirectTo: `${process.env.APP_BASE_URL || 'https://myhome.homesteadarchitect.com'}/auth/callback`
      }
    );
    
    if (createError) {
      console.error('Error creating user:', createError);
      throw createError;
    }
    
    console.log(`New user provisioned: ${email} (${newUser.user.id}) - Invite sent: ${shouldSendInvite}`);
    return newUser.user.id;
    
  } catch (error) {
    console.error('User provisioning failed:', error);
    throw error;
  }
}

// =====================================================
// SUBSCRIPTION: Create or update subscription record
// =====================================================
async function upsertSubscription(userId, subscriptionData) {
  const {
    stripeCustomerId,
    stripeSubscriptionId,
    stripePriceId,
    plan,
    status,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd
  } = subscriptionData;
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      stripe_price_id: stripePriceId,
      plan: plan,
      status: status,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: cancelAtPeriodEnd || false,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
    .select();
  
  if (error) {
    console.error('Error upserting subscription:', error);
    throw error;
  }
  
  console.log(`Subscription upserted for user ${userId}: plan=${plan}, status=${status}`);
  
  // Sync entitlements based on plan
  await syncEntitlements(userId, plan);
  
  return data;
}

// =====================================================
// ENTITLEMENTS: Sync user entitlements from plan
// =====================================================
async function syncEntitlements(userId, plan) {
  const { error } = await supabase.rpc('sync_user_entitlements', {
    p_user_id: userId,
    p_plan: plan
  });
  
  if (error) {
    console.error('Error syncing entitlements:', error);
    // Don't throw - entitlements are secondary to subscription
  } else {
    console.log(`Entitlements synced for user ${userId}: plan=${plan}`);
  }
}

// =====================================================
// EVENT HANDLER: checkout.session.completed
// =====================================================
async function handleCheckoutSessionCompleted(session) {
  console.log('Processing checkout.session.completed:', session.id);
  
  // Get customer email
  const email = session.customer_details?.email || session.customer_email;
  
  if (!email) {
    console.error('No email found in checkout session');
    throw new Error('No email found in checkout session');
  }
  
  // Ensure we have subscription data
  if (!session.subscription) {
    console.log('Checkout session has no subscription - skipping provisioning');
    return;
  }
  
  // Fetch full subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  const priceId = subscription.items.data[0].price.id;
  const plan = PRICE_TO_PLAN[priceId] || 'basic';
  
  // Provision user AFTER payment confirmed
  const userId = await provisionUser(email);
  
  // Create subscription record
  await upsertSubscription(userId, {
    stripeCustomerId: session.customer,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    plan: plan,
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end
  });
  
  console.log(`✅ Checkout completed: ${email} → ${plan} plan`);
}

// =====================================================
// EVENT HANDLER: customer.subscription.updated
// =====================================================
async function handleSubscriptionUpdated(subscription) {
  console.log('Processing customer.subscription.updated:', subscription.id);
  
  // Find user by stripe subscription ID
  const { data: existingSub, error: findError } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();
  
  if (findError || !existingSub) {
    console.error('Subscription not found for update:', subscription.id);
    return;
  }
  
  const priceId = subscription.items.data[0].price.id;
  const plan = PRICE_TO_PLAN[priceId] || 'basic';
  
  await upsertSubscription(existingSub.user_id, {
    stripeCustomerId: subscription.customer,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    plan: plan,
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end
  });
  
  console.log(`✅ Subscription updated: ${subscription.id} → ${plan} (${subscription.status})`);
}

// =====================================================
// EVENT HANDLER: customer.subscription.deleted
// =====================================================
async function handleSubscriptionDeleted(subscription) {
  console.log('Processing customer.subscription.deleted:', subscription.id);
  
  // Find user by stripe subscription ID
  const { data: existingSub, error: findError } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();
  
  if (findError || !existingSub) {
    console.error('Subscription not found for deletion:', subscription.id);
    return;
  }
  
  // Downgrade to free plan
  await upsertSubscription(existingSub.user_id, {
    stripeCustomerId: subscription.customer,
    stripeSubscriptionId: subscription.id,
    stripePriceId: null,
    plan: 'free',
    status: 'canceled',
    currentPeriodStart: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false
  });
  
  console.log(`✅ Subscription deleted: ${subscription.id} → downgraded to free`);
}

// =====================================================
// EVENT HANDLER: invoice.paid
// =====================================================
async function handleInvoicePaid(invoice) {
  console.log('Processing invoice.paid:', invoice.id);
  
  if (!invoice.subscription) {
    console.log('Invoice has no subscription - skipping');
    return;
  }
  
  // Fetch subscription details
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  
  // Find user by stripe subscription ID
  const { data: existingSub, error: findError } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();
  
  if (findError || !existingSub) {
    console.error('Subscription not found for invoice:', subscription.id);
    return;
  }
  
  const priceId = subscription.items.data[0].price.id;
  const plan = PRICE_TO_PLAN[priceId] || 'basic';
  
  // Update subscription to active
  await upsertSubscription(existingSub.user_id, {
    stripeCustomerId: subscription.customer,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    plan: plan,
    status: 'active',
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end
  });
  
  console.log(`✅ Invoice paid: ${invoice.id} → subscription active`);
}

// =====================================================
// EVENT HANDLER: invoice.payment_failed
// =====================================================
async function handleInvoicePaymentFailed(invoice) {
  console.log('Processing invoice.payment_failed:', invoice.id);
  
  if (!invoice.subscription) {
    console.log('Invoice has no subscription - skipping');
    return;
  }
  
  // Fetch subscription details
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  
  // Find user by stripe subscription ID
  const { data: existingSub, error: findError } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();
  
  if (findError || !existingSub) {
    console.error('Subscription not found for failed invoice:', subscription.id);
    return;
  }
  
  const priceId = subscription.items.data[0].price.id;
  const plan = PRICE_TO_PLAN[priceId] || 'basic';
  
  // Update subscription to past_due
  await upsertSubscription(existingSub.user_id, {
    stripeCustomerId: subscription.customer,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    plan: plan,
    status: 'past_due',
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end
  });
  
  console.log(`⚠️ Invoice payment failed: ${invoice.id} → subscription past_due`);
}

// =====================================================
// MAIN WEBHOOK HANDLER
// =====================================================
async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).send('Webhook secret not configured');
  }
  
  let event;
  
  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  console.log(`\n🔔 Webhook received: ${event.type} (${event.id})`);
  
  try {
    // Check idempotency
    if (await isEventProcessed(event.id)) {
      console.log(`✓ Event already processed: ${event.id} - returning 200`);
      return res.status(200).json({ received: true, processed: 'duplicate' });
    }
    
    // Mark event as being processed
    await markEventProcessed(event.id, event.type, event.data.object);
    
    // Route to appropriate handler
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    console.log(`✅ Event processed successfully: ${event.id}\n`);
    return res.status(200).json({ received: true, processed: true });
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    // Return 500 to trigger Stripe retry
    return res.status(500).json({ 
      error: 'Webhook processing failed',
      message: error.message 
    });
  }
}

module.exports = { handleWebhook };

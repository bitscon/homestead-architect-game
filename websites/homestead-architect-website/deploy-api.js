// =====================================================
// Homestead Architect API Server
// =====================================================
// Handles: Stripe checkout, webhooks, user provisioning
// Port: 3001 (configured via PORT env var)

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { handleWebhook } = require('./api/stripe-webhook');

const app = express();
const PORT = process.env.PORT || 3001;

// =====================================================
// CRITICAL: Webhook endpoint MUST use raw body
// =====================================================
// Stripe webhook signature verification requires the raw request body
// This MUST be defined BEFORE express.json() middleware

app.post('/api/stripe/webhook', 
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// =====================================================
// Standard middleware (after webhook route)
// =====================================================
app.use(express.json());

// CORS middleware for cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// =====================================================
// HEALTH CHECK ENDPOINT
// =====================================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'homestead-architect-api',
    version: '1.0.0'
  });
});

// =====================================================
// CHECKOUT SESSION CREATION
// =====================================================
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { priceId, email, plan } = req.body;
    
    if (!priceId) {
      return res.status(400).json({ error: 'priceId is required' });
    }
    
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }
    
    console.log(`Creating checkout session: ${email} → ${plan || 'unknown'} (${priceId})`);
    
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${process.env.APP_BASE_URL || 'https://homesteadarchitect.com'}/checkout-complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_BASE_URL || 'https://homesteadarchitect.com'}/pricing`,
      metadata: {
        provision_mode: 'pay_first',
        plan: plan || 'unknown'
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_creation: 'always',
      automatic_tax: { enabled: false },
    });
    
    console.log(`✅ Checkout session created: ${session.id}`);
    
    return res.status(200).json({
      sessionId: session.id,
      url: session.url
    });
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
});

// =====================================================
// LEGACY ENDPOINT (backwards compatibility)
// =====================================================
app.post('/api/create-checkout-session', async (req, res) => {
  // Redirect to new endpoint
  return app.handle(
    { ...req, url: '/api/stripe/create-checkout-session' },
    res
  );
});

// =====================================================
// ERROR HANDLING
// =====================================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

// =====================================================
// START SERVER
// =====================================================
app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log('🚀 Homestead Architect API Server');
  console.log('='.repeat(60));
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/api/stripe/webhook`);
  console.log('='.repeat(60));
  
  // Validate required environment variables
  const required = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('⚠️ WARNING: Missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
    console.error('='.repeat(60));
  } else {
    console.log('✅ All required environment variables configured');
    console.log('='.repeat(60));
  }
});

// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

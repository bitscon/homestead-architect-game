# 🧪 Stripe Subscription Testing Guide

Complete guide for testing the Stripe subscription and user provisioning system.

---

## 📋 Prerequisites

### Required Environment Variables

Create `.env` file in `/var/www/homestead-api/`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...    # Get from Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_...  # Get from Stripe CLI or Dashboard

# Supabase Configuration  
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Service role key (NOT anon key)

# Application Configuration
APP_BASE_URL=https://homesteadarchitect.com
PORT=3001
NODE_ENV=development

# Optional
SEND_INVITE=true  # Set to false to skip sending invite emails
```

### Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/

# Windows
scoop install stripe

# Login to Stripe
stripe login
```

---

## 🚀 Testing Workflow

### 1. Start Local API Server

```bash
cd /var/www/homestead-api
npm install
node deploy-api.js
```

Expected output:
```
============================================================
🚀 Homestead Architect API Server
============================================================
Port: 3001
Environment: development
Health check: http://localhost:3001/health
Webhook endpoint: http://localhost:3001/api/stripe/webhook
============================================================
✅ All required environment variables configured
============================================================
```

### 2. Start Stripe CLI Webhook Forwarding

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

Expected output:
```
> Ready! You are using Stripe API Version [2024-11-20]. Your webhook signing secret is whsec_xxx (^C to quit)
```

**IMPORTANT:** Copy the webhook signing secret (`whsec_xxx`) and add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`.

### 3. Test Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-12-28T20:00:00.000Z",
  "service": "homestead-architect-api",
  "version": "1.0.0"
}
```

---

## 🧪 Test Scenarios

### Test 1: Checkout Session Creation

```bash
curl -X POST http://localhost:3001/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_1SjMSiL4MuRaMM4CHYCyQf6F",
    "email": "test@example.com",
    "plan": "basic"
  }'
```

Expected response:
```json
{
  "sessionId": "cs_test_xxx",
  "url": "https://checkout.stripe.com/c/pay/cs_test_xxx"
}
```

**What to verify:**
- ✅ Session ID returned
- ✅ Checkout URL is valid
- ✅ Opening URL shows Stripe checkout page

### Test 2: Simulate Checkout Completion

```bash
stripe trigger checkout.session.completed
```

Expected output in API logs:
```
🔔 Webhook received: checkout.session.completed (evt_xxx)
Processing checkout.session.completed: cs_test_xxx
New user provisioned: test@example.com (user-uuid) - Invite sent: true
Subscription upserted for user user-uuid: plan=basic, status=active
Entitlements synced for user user-uuid: plan=basic
✅ Checkout completed: test@example.com → basic plan
✅ Event processed successfully: evt_xxx
```

**What to verify:**
- ✅ User created in Supabase auth.users
- ✅ Row created in public.user_subscriptions
- ✅ Row created in public.user_entitlements
- ✅ Event recorded in public.stripe_events
- ✅ Invite email sent (if SEND_INVITE=true)

### Test 3: Simulate Invoice Payment

```bash
stripe trigger invoice.paid
```

Expected output:
```
🔔 Webhook received: invoice.paid (evt_xxx)
Processing invoice.paid: in_xxx
Subscription upserted for user user-uuid: plan=basic, status=active
✅ Invoice paid: in_xxx → subscription active
```

**What to verify:**
- ✅ Subscription status updated to 'active'
- ✅ Period dates updated correctly

### Test 4: Simulate Payment Failure

```bash
stripe trigger invoice.payment_failed
```

Expected output:
```
🔔 Webhook received: invoice.payment_failed (evt_xxx)
Processing invoice.payment_failed: in_xxx
Subscription upserted for user user-uuid: plan=basic, status=past_due
⚠️ Invoice payment failed: in_xxx → subscription past_due
```

**What to verify:**
- ✅ Subscription status updated to 'past_due'
- ✅ User still has access (grace period)

### Test 5: Simulate Subscription Cancellation

```bash
stripe trigger customer.subscription.deleted
```

Expected output:
```
🔔 Webhook received: customer.subscription.deleted (evt_xxx)
Processing customer.subscription.deleted: sub_xxx
Subscription upserted for user user-uuid: plan=free, status=canceled
✅ Subscription deleted: sub_xxx → downgraded to free
```

**What to verify:**
- ✅ Plan downgraded to 'free'
- ✅ Status set to 'canceled'
- ✅ Entitlements updated to free tier limits

### Test 6: Idempotency Check

Send the same webhook event twice:

```bash
# First time
stripe trigger checkout.session.completed

# Second time (should be idempotent)
stripe trigger checkout.session.completed
```

Expected output (second time):
```
🔔 Webhook received: checkout.session.completed (evt_xxx)
✓ Event already processed: evt_xxx - returning 200
```

**What to verify:**
- ✅ Second event returns 200 immediately
- ✅ No duplicate user created
- ✅ No duplicate subscription record
- ✅ Event exists only once in stripe_events table

---

## 📊 Database Verification

### Check User Created

```sql
SELECT id, email, created_at, raw_user_meta_data
FROM auth.users
WHERE email = 'test@example.com';
```

### Check Subscription Record

```sql
SELECT user_id, plan, status, stripe_customer_id, stripe_subscription_id,
       current_period_start, current_period_end
FROM public.user_subscriptions
WHERE stripe_customer_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

### Check Entitlements

```sql
SELECT user_id, can_access_dashboard, max_properties, max_animals, max_crops,
       can_export_data, can_use_analytics
FROM public.user_entitlements
ORDER BY updated_at DESC
LIMIT 5;
```

### Check Event Idempotency

```sql
SELECT event_id, type, processed_at
FROM public.stripe_events
ORDER BY created_at DESC
LIMIT 10;
```

---

## ✅ Acceptance Criteria Checklist

### Webhook Security
- [ ] Signature verification passes for valid events
- [ ] Signature verification fails for invalid signatures
- [ ] Webhook returns 400 for invalid signatures
- [ ] Webhook returns 200 for valid events

### Idempotency
- [ ] Same event processed only once
- [ ] Duplicate events return 200 but skip processing
- [ ] Event ID recorded in stripe_events table
- [ ] No duplicate users created
- [ ] No duplicate subscription records

### User Provisioning
- [ ] User created in auth.users after payment
- [ ] User NOT created before payment
- [ ] Existing users reused (no duplicates)
- [ ] Invite email sent (if configured)
- [ ] User can log in with invited email

### Subscription Management
- [ ] Subscription record created on checkout completion
- [ ] Plan correctly mapped from price ID
- [ ] Status updated on invoice.paid
- [ ] Status updated on payment_failed
- [ ] Plan downgraded to free on subscription deletion

### Entitlements
- [ ] Entitlements created for new users
- [ ] Entitlements updated on plan change
- [ ] Limits match plan definition
- [ ] Free tier: max_properties=2, max_animals=10
- [ ] Basic tier: max_properties=10, max_animals=50
- [ ] Pro tier: max_properties=9999, max_animals=9999

### Frontend Gating
- [ ] getUserSubscription() returns user data
- [ ] hasActiveSubscription() returns true for active
- [ ] hasPlan('pro') returns false for basic user
- [ ] canAccessFeature checks entitlements correctly

---

## 🐛 Troubleshooting

### Webhook Signature Verification Fails

**Symptom:** `⚠️ Webhook signature verification failed`

**Solution:**
1. Ensure `STRIPE_WEBHOOK_SECRET` matches Stripe CLI output
2. Verify webhook endpoint uses `express.raw()` middleware
3. Check that webhook route is defined BEFORE `express.json()`

### User Not Created

**Symptom:** Webhook processes but no user in database

**Solution:**
1. Check `SUPABASE_SERVICE_ROLE_KEY` is correct (not anon key)
2. Verify Supabase project URL is correct
3. Check API logs for Supabase errors
4. Ensure email is present in checkout session

### Duplicate Users Created

**Symptom:** Multiple users with same email

**Solution:**
1. Check idempotency logic in webhook handler
2. Verify event_id is being recorded in stripe_events
3. Ensure unique constraint on stripe_customer_id

### Subscription Status Not Updating

**Symptom:** Status remains 'incomplete' after payment

**Solution:**
1. Ensure `invoice.paid` webhook is being received
2. Check that subscription ID matches in database
3. Verify webhook handler processes invoice.paid event

---

## 🔐 Production Deployment Checklist

Before deploying to production:

- [ ] Replace test Stripe keys with live keys
- [ ] Update `STRIPE_WEBHOOK_SECRET` with production webhook secret
- [ ] Configure webhook endpoint in Stripe Dashboard
- [ ] Set `APP_BASE_URL` to production domain
- [ ] Enable SSL/HTTPS on webhook endpoint
- [ ] Test with real payment (use $1 test transaction)
- [ ] Verify email invites are being sent
- [ ] Monitor webhook events in Stripe Dashboard
- [ ] Set up error alerting for failed webhooks
- [ ] Document rollback procedure

---

## 📞 Support Commands

### View Live Webhook Events

```bash
# View all events in real-time
stripe listen

# Filter by event type
stripe listen --events checkout.session.completed,invoice.paid
```

### View Webhook Logs in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Click on your webhook endpoint
3. View "Recent deliveries" tab

### Manually Trigger Events

```bash
# List available events
stripe trigger --help

# Trigger specific event with custom data
stripe trigger checkout.session.completed \
  --override customer_details.email=custom@example.com
```

---

## ✨ Testing Complete!

Once all acceptance criteria pass, your Stripe integration is production-ready.

**Next Steps:**
1. Deploy to production VPS
2. Configure production webhook in Stripe Dashboard
3. Test with real payment
4. Monitor for 24 hours
5. Celebrate! 🎉

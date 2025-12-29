# Next Steps

This file outlines the current goal and actionable next steps for development sessions.

## Current Goal
**Status:** Complete standalone website with Stripe integration deployed to GitHub ✅
**Goal:** Standalone landing page with monthly/yearly pricing and free tier - COMPLETE

## Completed Tasks (Dec 28, 2025)
- ✅ Created complete standalone website for homesteadarchitect.com
- ✅ Extracted landing page from main app into modular components
- ✅ Implemented complete Stripe checkout integration with hosted checkout
- ✅ Built pricing component with Free, Basic ($4.99), and Pro ($19.99) tiers
- ✅ Added monthly/yearly pricing toggle with 50% yearly discount
- ✅ Configured actual Stripe Price IDs (4 total: Basic/Pro × Monthly/Yearly)
- ✅ Created secure serverless API for checkout session creation
- ✅ Added success/error pages for Stripe redirect handling
- ✅ Created OVH VPS deployment configuration with PM2 and Nginx
- ✅ Built production-optimized website (188KB JS, 18KB CSS)
- ✅ Created comprehensive deployment documentation
- ✅ Rebuilt Docker dev environment with latest code
- ✅ Committed and pushed all changes to GitHub

## Immediate Next Steps

### Production Deployment to OVH VPS
- [ ] **Deploy API Server**: Upload `api/` folder to OVH VPS and configure PM2
- [ ] **Deploy Website**: Upload `dist/` folder to homesteadarchitect.com web root
- [ ] **Configure Nginx**: Set up reverse proxy for API and static files
- [ ] **Enable SSL**: Install Let's Encrypt certificate for HTTPS
- [ ] **Test Complete Flow**: Free tier, monthly/yearly pricing, payment success

### Post-Deployment Verification
- [ ] Test free tier redirect to main app with ?plan=free parameter
- [ ] Test Basic plan monthly subscription ($4.99)
- [ ] Test Basic plan yearly subscription ($29.99)
- [ ] Test Pro plan monthly subscription ($19.99)
- [ ] Test Pro plan yearly subscription ($229.99)
- [ ] Verify Stripe webhooks are firing correctly
- [ ] Monitor successful payment confirmations in Stripe Dashboard

### Optional Enhancements
- [ ] Add Google Analytics or Plausible for traffic tracking
- [ ] Implement webhook integration for automatic account provisioning
- [ ] Add contact form or support chat widget
- [ ] Create newsletter signup functionality
- [ ] Add testimonials or social proof section
- [ ] Implement A/B testing for pricing/copy optimization

## Open Questions
- Does the main app handle the ?plan=free parameter for account creation?
- Should we add webhook integration to auto-provision accounts after payment?
- Do you want analytics tracking on the landing page?
- Any content or design tweaks needed before going live?

## Current Blockers
- None identified - All development work complete and ready for deployment
- Deployment package ready: `websites/homestead-architect-website/homestead-architect-website-v1.0.0.zip` (307KB)
- OVH VPS deployment guide: `websites/homestead-architect-website/DEPLOYMENT.md`
- All Stripe Price IDs configured and functional

## Stripe Price IDs Configured
- ✅ Basic Monthly: `price_1SjMSiL4MuRaMM4CHYCyQf6F`
- ✅ Basic Yearly: `price_1SjMSiL4MuRaMM4CLhZnK7UJ`
- ✅ Pro Monthly: `price_1SjMTOL4MuRaMM4C209NcRgl`
- ✅ Pro Yearly: `price_1SjMTOL4MuRaMM4CPbRJ5O86`

## Development Environment Status
- [x] Standalone website built and packaged
- [x] Stripe integration complete with actual Price IDs
- [x] Monthly/yearly pricing toggle functional
- [x] Free tier implemented with direct redirect
- [x] Success/error pages created
- [x] OVH VPS deployment scripts created
- [x] Docker dev environment rebuilt and running
- [x] All changes committed to GitHub (commit: 9943d30)

## Production Deployment Checklist
**Follow DEPLOYMENT.md for step-by-step instructions:**

### API Server (OVH VPS)
- [ ] SSH to OVH VPS
- [ ] Create `/var/www/homestead-api/` directory
- [ ] Upload API files from deployment package
- [ ] Run `npm install` in API directory
- [ ] Set `STRIPE_SECRET_KEY` environment variable
- [ ] Start API with PM2: `pm2 start deploy-api.js --name homestead-api`
- [ ] Verify API health: `curl http://localhost:3001/health`

### Website (OVH VPS)
- [ ] Create `/var/www/homesteadarchitect.com/` directory
- [ ] Upload all files from `dist/` folder
- [ ] Set proper permissions: `chown -R www-data:www-data`
- [ ] Configure Nginx reverse proxy
- [ ] Test Nginx config: `nginx -t`
- [ ] Reload Nginx: `systemctl reload nginx`

### SSL & Security
- [ ] Install Certbot: `apt-get install certbot python3-certbot-nginx`
- [ ] Get SSL certificate: `certbot --nginx -d homesteadarchitect.com`
- [ ] Enable auto-renewal: `certbot renew --dry-run`
- [ ] Verify HTTPS is working

### Final Testing
- [ ] Visit https://homesteadarchitect.com
- [ ] Test free tier signup flow
- [ ] Test monthly pricing for Basic/Pro
- [ ] Test yearly pricing for Basic/Pro
- [ ] Complete test purchase with Stripe test card
- [ ] Verify success page redirect
- [ ] Monitor Stripe Dashboard for payment confirmation

## Notes for Next Session
- Start by reading AGENT_SOP.md, PROGRESS.md, NEXT.md, and README.md
- Check deployment status and troubleshoot any issues
- Verify complete user journey from landing page to main app
- Consider adding webhook integration for automatic account provisioning
- Monitor user acquisition and conversion metrics
- Plan next feature development or optimization work

# Next Steps

This file outlines the current goal and actionable next steps for development sessions.

## Current Goal
**Status:** Production-ready deployment package created and ready for OVH VPS ✅
**Goal:** Deploy landing page to homesteadarchitect.com and test complete user flow

## Completed Tasks (Dec 28, 2025)

### Morning Session - Website Development
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

### Afternoon Session - Production Preparation
- ✅ Updated all URLs from dev to production endpoints
- ✅ Fixed free tier redirect (myhome.homesteadarchitect.com)
- ✅ Fixed navigation login/signup links
- ✅ Fixed success page dashboard redirect
- ✅ Rebuilt website with production configuration (v1.0.1)
- ✅ Created automated deployment script (DEPLOY_TO_VPS.sh)
- ✅ Created step-by-step deployment guide (DEPLOYMENT_STEPS.md)
- ✅ Created quick reference guide (READY_TO_DEPLOY.md)
- ✅ Generated production deployment package (316KB)
- ✅ Committed and pushed all changes to GitHub (commit: 2672e03)

## Immediate Next Steps

### 🚀 Deploy via GitHub Actions (RECOMMENDED)

**Workflow:** `.github/workflows/deploy-website.yml`  
**Server:** `vps-5385eb51.vps.ovh.us` (15.204.225.161)  
**Documentation:** See `READY_TO_DEPLOY.md` for post-deployment steps

### Step 1: Run GitHub Actions Workflow
- [ ] Go to: https://github.com/bitscon/homestead-architect-game/actions
- [ ] Select: **"Deploy Landing Page Website"** workflow
- [ ] Click: **"Run workflow"**
- [ ] Type: `deploy` to confirm
- [ ] Select log level: `info` (or `debug` for troubleshooting)
- [ ] Click: **"Run workflow"** button
- [ ] Monitor: Workflow will build website, deploy API + website files, start PM2

### Step 2: Configure Nginx (After Workflow Completes)
- [ ] SSH to server: `ssh billybs@vps-5385eb51.vps.ovh.us`
- [ ] Run: `cd ~/apps/homestead-architect-game/websites/homestead-architect-website`
- [ ] Run: `sudo bash configure-nginx.sh`
- [ ] Verify: `sudo nginx -t` and `sudo systemctl status nginx`

### Step 3: Enable SSL
- [ ] Run: `sudo certbot --nginx -d homesteadarchitect.com -d www.homesteadarchitect.com`
- [ ] Follow prompts to configure SSL
- [ ] Test: Visit `https://homesteadarchitect.com`

### Alternative: Manual Deployment
If GitHub Actions fails, use manual deployment:
- [ ] See `DEPLOYMENT_STEPS.md` for complete manual process
- [ ] Or run: `DEPLOY_TO_VPS.sh` script on server

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

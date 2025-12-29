# 🎯 Ready to Deploy - Quick Start Guide

## ✅ What's Been Completed

Your Homestead Architect landing page is **100% ready for production deployment**!

### Changes Made (Dec 28, 2025)
- ✅ Updated all URLs from dev (`mybarn.barn.workshop.home`) to production (`myhome.homesteadarchitect.com`)
- ✅ Rebuilt website with production configuration
- ✅ Created comprehensive deployment scripts (automated + manual)
- ✅ Created step-by-step deployment guide
- ✅ Generated new deployment package (v1.0.1 - 316KB)
- ✅ Committed and pushed all changes to GitHub

### Deployment Package Location
```
~/apps/homestead-architect/websites/homestead-architect-website/homestead-architect-website-v1.0.1.zip
```

---

## 🚀 Deployment Options

### Option 1: Automated Deployment (Recommended)

**Upload and run the automated script:**

```bash
# 1. Download deployment package to your local machine
# Located at: homestead-architect-website-v1.0.1.zip

# 2. SSH to your server
ssh billybs@vps-5385eb51.vps.ovh.us

# 3. Upload the deployment package
# (Use FileZilla, scp, or your preferred method)

# 4. Extract the package
unzip homestead-architect-website-v1.0.1.zip -d ~/homestead-deploy
cd ~/homestead-deploy

# 5. Run automated deployment script
sudo bash DEPLOY_TO_VPS.sh
```

The script will:
- Install Node.js 20 and PM2
- Deploy API server to `/var/www/homestead-api`
- Deploy website to `/var/www/homesteadarchitect.com`
- Configure Nginx with reverse proxy
- Set up SSL with Let's Encrypt
- Start all services and verify deployment

---

### Option 2: Manual Step-by-Step Deployment

Follow the comprehensive guide in **DEPLOYMENT_STEPS.md** for manual deployment.

**Quick manual deployment:**

1. **Install Node.js 20** (if needed):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
   sudo apt-get install -y nodejs
   ```

2. **Install PM2**:
   ```bash
   sudo npm install -g pm2
   ```

3. **Deploy API** (upload files to `/var/www/homestead-api`):
   ```bash
   sudo mkdir -p /var/www/homestead-api
   # Upload: api/, deploy-api.js
   cd /var/www/homestead-api
   sudo npm install
   
   # Create .env file
   sudo nano .env
   # Add:
   # STRIPE_SECRET_KEY=sk_org_live_0fL8PgbAE9xdc902t0e9v1Rt7bo76Kbi29uc6fX2FA3q97u979r8593BL5CH71q6Xm7xG60H4K37pV6xs3Cj3KE3mq3GT5y15hP3mh70O3qe7T254X3u56CB05F0xg09P3qa1V2aVwcCj8B028R2Mab0J9KYafQ5kag8350D5a9djO6Of0LMgYz9mXel07uVaM4aHU1lF7vh6wB7JDfwOeYn8nF7fK01
   # PORT=3001
   # NODE_ENV=production
   
   # Start with PM2
   pm2 start deploy-api.js --name homestead-api
   pm2 startup
   pm2 save
   ```

4. **Deploy Website** (upload files to `/var/www/homesteadarchitect.com`):
   ```bash
   sudo mkdir -p /var/www/homesteadarchitect.com
   # Upload: dist/* (all files from dist folder)
   sudo chown -R www-data:www-data /var/www/homesteadarchitect.com
   sudo chmod -R 755 /var/www/homesteadarchitect.com
   ```

5. **Configure Nginx** (see DEPLOYMENT_STEPS.md for full config)

6. **Enable SSL**:
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d homesteadarchitect.com -d www.homesteadarchitect.com
   ```

---

## 🧪 Testing After Deployment

### 1. Test API Health
```bash
curl https://homesteadarchitect.com/api/health
# Expected: {"status":"OK","timestamp":"..."}
```

### 2. Test Website
Visit: **https://homesteadarchitect.com**

### 3. Test Free Tier Flow
- Click "Get Started Free"
- Should redirect to: `https://myhome.homesteadarchitect.com/auth/register?plan=free`

### 4. Test Stripe Checkout
- Click "Start Basic Plan" (monthly)
- Should open Stripe checkout
- Use test card: `4242 4242 4242 4242`
- Complete checkout
- Should redirect to success page
- Success page should have button to: `https://myhome.homesteadarchitect.com/auth/login`

---

## 📊 Stripe Pricing Configuration

Your pricing is already configured with actual Stripe Price IDs:

| Plan | Monthly | Yearly | Stripe Price IDs |
|------|---------|--------|-----------------|
| **Free** | $0 | $0 | No Stripe (direct redirect) |
| **Basic** | $4.99/mo | $29.99/yr | Monthly: `price_1SjMSiL4MuRaMM4CHYCyQf6F`<br>Yearly: `price_1SjMSiL4MuRaMM4CLhZnK7UJ` |
| **Pro** | $19.99/mo | $229.99/yr | Monthly: `price_1SjMTOL4MuRaMM4C209NcRgl`<br>Yearly: `price_1SjMTOL4MuRaMM4CPbRJ5O86` |

---

## 🔧 Troubleshooting

### API Not Running
```bash
pm2 status
pm2 logs homestead-api
pm2 restart homestead-api
```

### Website Not Loading
```bash
sudo systemctl status nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Stripe Checkout Issues
```bash
pm2 logs homestead-api --lines 50
```

---

## 📝 Post-Deployment Checklist

After deployment, verify:

- [ ] API health check returns OK
- [ ] Website loads at https://homesteadarchitect.com
- [ ] Free plan button works (redirects to myhome.homesteadarchitect.com)
- [ ] Monthly pricing toggle works
- [ ] Yearly pricing toggle works (shows 50% discount)
- [ ] Basic plan checkout opens Stripe
- [ ] Pro plan checkout opens Stripe
- [ ] SSL certificate is active (green padlock)
- [ ] PM2 is running and saved
- [ ] Nginx is running without errors

---

## 🎉 You're Ready!

Everything is configured and ready to go live. Choose your deployment method and follow the steps above.

**Need Help?**
- Automated script: `DEPLOY_TO_VPS.sh`
- Step-by-step guide: `DEPLOYMENT_STEPS.md`
- Full documentation: `DEPLOYMENT.md`

**What You're Deploying:**
- Production-optimized website (188KB JS, 18KB CSS, 244KB image)
- Complete Stripe payment integration
- Free tier for user acquisition
- Monthly/yearly pricing with 50% yearly discount
- Secure API server with environment variables
- Full SSL encryption

**Your URLs:**
- Landing page: https://homesteadarchitect.com
- Main app: https://myhome.homesteadarchitect.com
- API: https://homesteadarchitect.com/api/*

Start acquiring users and processing payments! 🚀

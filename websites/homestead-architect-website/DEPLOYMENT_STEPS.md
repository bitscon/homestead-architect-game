# 🚀 Homestead Architect - Simple Deployment Guide

This guide will walk you through deploying the website to your OVH VPS step-by-step.

## 📋 Prerequisites

- SSH access to: `vps-5385eb51.vps.ovh.us`
- Domain pointing to: `15.204.225.161`
- Files ready in: `homestead-architect-website-v1.0.0.zip`

---

## ⚡ Quick Deploy (Automated)

Upload the deployment script and run it:

```bash
# 1. SSH to your server
ssh billybs@vps-5385eb51.vps.ovh.us

# 2. Download deployment script
# (Upload DEPLOY_TO_VPS.sh to server first)

# 3. Run deployment script
sudo bash DEPLOY_TO_VPS.sh
```

The script will guide you through the process interactively.

---

## 📝 Manual Deployment (Step-by-Step)

### Step 1: SSH to Server

```bash
ssh billybs@vps-5385eb51.vps.ovh.us
```

### Step 2: Install Node.js 20 (if not installed)

```bash
# Check if Node.js is installed
node --version

# If not installed or version < 20:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

# Verify
node --version  # Should show v20.x
npm --version   # Should show 10.x
```

### Step 3: Install PM2 Process Manager

```bash
sudo npm install -g pm2

# Verify
pm2 --version
```

### Step 4: Create Directories

```bash
sudo mkdir -p /var/www/homestead-api
sudo mkdir -p /var/www/homesteadarchitect.com
```

### Step 5: Deploy API Server

#### 5a. Upload API files to `/var/www/homestead-api/`:

From your local machine:
```bash
cd ~/apps/homestead-architect/websites/homestead-architect-website

# Upload API files
scp -r api billybs@vps-5385eb51.vps.ovh.us:/tmp/
scp deploy-api.js billybs@vps-5385eb51.vps.ovh.us:/tmp/
```

On the server:
```bash
sudo mv /tmp/api/* /var/www/homestead-api/
sudo mv /tmp/deploy-api.js /var/www/homestead-api/
```

#### 5b. Create package.json for API:

```bash
cd /var/www/homestead-api

sudo tee package.json > /dev/null << 'EOF'
{
  "name": "homestead-api",
  "version": "1.0.0",
  "description": "Homestead Architect API Server",
  "main": "deploy-api.js",
  "scripts": {
    "start": "node deploy-api.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "stripe": "^14.10.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
EOF
```

#### 5c. Install dependencies:

```bash
cd /var/www/homestead-api
sudo npm install
```

#### 5d. Create environment file:

```bash
sudo tee /var/www/homestead-api/.env > /dev/null << 'EOF'
STRIPE_SECRET_KEY=sk_org_live_0fL8PgbAE9xdc902t0e9v1Rt7bo76Kbi29uc6fX2FA3q97u979r8593BL5CH71q6Xm7xG60H4K37pV6xs3Cj3KE3mq3GT5y15hP3mh70O3qe7T254X3u56CB05F0xg09P3qa1V2aVwcCj8B028R2Mab0J9KYafQ5kag8350D5a9djO6Of0LMgYz9mXel07uVaM4aHU1lF7vh6wB7JDfwOeYn8nF7fK01
PORT=3001
NODE_ENV=production
EOF

sudo chmod 600 /var/www/homestead-api/.env
```

#### 5e. Start API with PM2:

```bash
cd /var/www/homestead-api
pm2 delete homestead-api 2>/dev/null || true
pm2 start deploy-api.js --name homestead-api
pm2 startup
pm2 save
```

#### 5f. Verify API is running:

```bash
curl http://localhost:3001/health
# Should return: {"status":"OK","timestamp":"..."}

pm2 status
# Should show homestead-api as "online"
```

### Step 6: Deploy Website Files

#### 6a. Upload website from local machine:

```bash
cd ~/apps/homestead-architect/websites/homestead-architect-website

# Upload dist folder
scp -r dist/* billybs@vps-5385eb51.vps.ovh.us:/tmp/website/
```

#### 6b. Move to web directory on server:

```bash
sudo mv /tmp/website/* /var/www/homesteadarchitect.com/
sudo chown -R www-data:www-data /var/www/homesteadarchitect.com
sudo chmod -R 755 /var/www/homesteadarchitect.com
```

### Step 7: Configure Nginx

```bash
sudo tee /etc/nginx/sites-available/homesteadarchitect.com > /dev/null << 'EOF'
server {
    listen 80;
    server_name homesteadarchitect.com www.homesteadarchitect.com;
    
    # API proxy to Node.js server
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Website static files
    location / {
        root /var/www/homesteadarchitect.com;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/homesteadarchitect.com /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 8: Enable SSL with Let's Encrypt

```bash
# Install Certbot (if not installed)
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d homesteadarchitect.com -d www.homesteadarchitect.com

# Follow prompts:
# - Enter email address
# - Agree to terms of service
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## 🧪 Testing Your Deployment

### 1. Test API Health

```bash
curl https://homesteadarchitect.com/api/health
# Expected: {"status":"OK","timestamp":"2025-12-28T..."}
```

### 2. Test Website Loading

```bash
curl -I https://homesteadarchitect.com
# Expected: HTTP/2 200
```

### 3. Test in Browser

Visit: https://homesteadarchitect.com

**What to test:**
- ✅ Landing page loads with hero image
- ✅ Pricing section shows Free, Basic, Pro tiers
- ✅ Monthly/Yearly toggle works
- ✅ "Get Started Free" redirects to main app
- ✅ "Start Basic Plan" opens Stripe checkout
- ✅ "Start Pro Plan" opens Stripe checkout

### 4. Test Stripe Checkout Flow

1. Click "Start Basic Plan" (monthly)
2. Should redirect to Stripe checkout
3. Use test card: `4242 4242 4242 4242`
4. Expiry: Any future date (e.g., 12/34)
5. CVC: Any 3 digits (e.g., 123)
6. Complete checkout
7. Should redirect to success page

### 5. Monitor Logs

```bash
# API logs
pm2 logs homestead-api

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🔧 Troubleshooting

### API Not Responding

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs homestead-api

# Restart API
pm2 restart homestead-api

# Check if port 3001 is in use
sudo netstat -tulpn | grep 3001
```

### Website Not Loading

```bash
# Check Nginx status
sudo systemctl status nginx

# Test Nginx config
sudo nginx -t

# View error logs
sudo tail -50 /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Stripe Checkout Not Working

```bash
# Check API logs for errors
pm2 logs homestead-api --lines 50

# Test checkout endpoint directly
curl -X POST https://homesteadarchitect.com/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"priceId":"price_1SjMSiL4MuRaMM4CHYCyQf6F","successUrl":"https://homesteadarchitect.com/success","cancelUrl":"https://homesteadarchitect.com"}'
```

### SSL Issues

```bash
# Check SSL certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check Nginx SSL configuration
sudo nginx -T | grep ssl
```

---

## 📊 Monitoring Commands

```bash
# Check all services
pm2 status
sudo systemctl status nginx

# View API logs in real-time
pm2 logs homestead-api --lines 100

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Check disk usage
df -h

# Check memory usage
free -h

# Check process list
ps aux | grep -E 'node|nginx'
```

---

## 🎯 Post-Deployment Checklist

- [ ] API health check returns OK: `curl https://homesteadarchitect.com/api/health`
- [ ] Website loads at: `https://homesteadarchitect.com`
- [ ] Free plan button redirects to main app with `?plan=free`
- [ ] Monthly pricing displays correctly
- [ ] Yearly pricing displays correctly (50% discount)
- [ ] Stripe checkout works for Basic plan
- [ ] Stripe checkout works for Pro plan
- [ ] SSL certificate is active (green padlock in browser)
- [ ] PM2 is running and saved: `pm2 status`
- [ ] Nginx is running: `systemctl status nginx`
- [ ] No errors in logs: `pm2 logs homestead-api`

---

## 🔄 Updating the Website

When you need to update the website:

```bash
# 1. Build new version locally
cd ~/apps/homestead-architect/websites/homestead-architect-website
npm run build

# 2. Upload to server
scp -r dist/* billybs@vps-5385eb51.vps.ovh.us:/tmp/website-update/

# 3. On server, replace files
ssh billybs@vps-5385eb51.vps.ovh.us
sudo rm -rf /var/www/homesteadarchitect.com/*
sudo mv /tmp/website-update/* /var/www/homesteadarchitect.com/
sudo chown -R www-data:www-data /var/www/homesteadarchitect.com

# 4. Clear browser cache and test
```

---

## 🎉 Success!

Your Homestead Architect landing page is now live at:
**https://homesteadarchitect.com**

**Stripe Pricing Configured:**
- Free: Direct redirect to app
- Basic: $4.99/month or $29.99/year
- Pro: $19.99/month or $229.99/year

Start acquiring users and processing payments! 🚀

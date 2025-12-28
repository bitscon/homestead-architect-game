# 🚀 Homestead Architect - OVH VPS Deployment Guide

## ✅ **What's Included**

Your deployment package contains:
- ✅ **Production Website**: Optimized static files (188KB JS, 18KB CSS)
- ✅ **Stripe Integration**: Complete payment processing with actual Price IDs
- ✅ **Free Plan**: Zero-barrier user acquisition flow
- ✅ **Monthly/Yearly Pricing**: Toggle between billing cycles with 50% yearly savings
- ✅ **API Server**: Node.js Express server for Stripe checkout sessions
- ✅ **OVH VPS Configuration**: Complete deployment scripts

---

## 📋 **Your Pricing Structure**

### **Configured Stripe Price IDs:**

| Plan | Monthly | Yearly | Stripe Price IDs |
|------|---------|--------|-----------------|
| **Free** | $0 | $0 | No Stripe (direct redirect) |
| **Basic** | $4.99/mo | $29.99/yr | Monthly: `price_1SjMSiL4MuRaMM4CHYCyQf6F`<br>Yearly: `price_1SjMSiL4MuRaMM4CLhZnK7UJ` |
| **Pro** | $19.99/mo | $229.99/yr | Monthly: `price_1SjMTOL4MuRaMM4C209NcRgl`<br>Yearly: `price_1SjMTOL4MuRaMM4CPbRJ5O86` |

---

## 🎯 **Step 1: Deploy API to OVH VPS**

### **SSH into your OVH server:**
```bash
ssh root@your-ovh-server-ip
```

### **Create API directory:**
```bash
mkdir -p /var/www/homestead-api
cd /var/www/homestead-api
```

### **Upload API files:**
Upload these files from the zip to `/var/www/homestead-api/`:
- `api/create-checkout-session.js`
- `deploy-api.js`
- `api/package.json`

### **Install dependencies:**
```bash
npm install
```

### **Set environment variables:**
```bash
# Create .env file
cat > .env << 'EOF'
STRIPE_SECRET_KEY=sk_org_live_0fL8PgbAE9xdc902t0e9v1Rt7bo76Kbi29uc6fX2FA3q97u979r8593BL5CH71q6Xm7xG60H4K37pV6xs3Cj3KE3mq3GT5y15hP3mh70O3qe7T254X3u56CB05F0xg09P3qa1V2aVwcCj8B028R2Mab0J9KYafQ5kag8350D5a9djO6Of0LMgYz9mXel07uVaM4aHU1lF7vh6wB7JDfwOeYn8nF7fK01
PORT=3001
NODE_ENV=production
EOF
```

### **Install PM2 for process management:**
```bash
npm install -g pm2
```

### **Start API server with PM2:**
```bash
pm2 start deploy-api.js --name homestead-api
pm2 startup
pm2 save
```

### **Verify API is running:**
```bash
curl http://localhost:3001/health
# Should return: {"status":"OK","timestamp":"..."}
```

---

## 🌐 **Step 2: Deploy Website to OVH VPS**

### **Create website directory:**
```bash
mkdir -p /var/www/homesteadarchitect.com
cd /var/www/homesteadarchitect.com
```

### **Upload website files:**
Upload all files from `dist/` folder in the zip to `/var/www/homesteadarchitect.com/`

### **Set proper permissions:**
```bash
chown -R www-data:www-data /var/www/homesteadarchitect.com
chmod -R 755 /var/www/homesteadarchitect.com
```

---

## 🔧 **Step 3: Configure Nginx**

### **Create Nginx configuration:**
```bash
nano /etc/nginx/sites-available/homesteadarchitect.com
```

### **Add this configuration:**
```nginx
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
```

### **Enable the site:**
```bash
ln -s /etc/nginx/sites-available/homesteadarchitect.com /etc/nginx/sites-enabled/
```

### **Test Nginx configuration:**
```bash
nginx -t
```

### **Reload Nginx:**
```bash
systemctl reload nginx
```

---

## 🔒 **Step 4: Set Up SSL with Let's Encrypt (Recommended)**

```bash
# Install Certbot
apt-get update
apt-get install certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d homesteadarchitect.com -d www.homesteadarchitect.com

# Enable auto-renewal
certbot renew --dry-run
```

---

## 🧪 **Step 5: Test Your Deployment**

### **Test API Health:**
```bash
curl https://homesteadarchitect.com/api/health
# Should return: {"status":"OK"}
```

### **Test Website:**
1. Visit: `https://homesteadarchitect.com`
2. Should see beautiful landing page with pricing

### **Test Free Plan:**
1. Click "Get Started Free"
2. Should redirect to: `https://mybarn.barn.workshop.home/auth/register?plan=free`

### **Test Paid Plans:**
1. Click "Start Basic Plan" (monthly or yearly)
2. Should redirect to Stripe hosted checkout
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. Should redirect back to success page

---

## 📊 **Monitor Your Deployment**

### **Check API logs:**
```bash
pm2 logs homestead-api
```

### **Check API status:**
```bash
pm2 status
```

### **Restart API:**
```bash
pm2 restart homestead-api
```

### **Check Nginx logs:**
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🔧 **Troubleshooting**

### **API not responding:**
```bash
pm2 restart homestead-api
pm2 logs homestead-api
```

### **Website not loading:**
```bash
nginx -t
systemctl status nginx
```

### **Stripe checkout not working:**
1. Check API logs: `pm2 logs homestead-api`
2. Verify Price IDs in Stripe Dashboard
3. Test with: `curl -X POST https://homesteadarchitect.com/api/create-checkout-session`

### **Free plan redirect not working:**
Check browser console for JavaScript errors

---

## ✅ **Post-Deployment Checklist**

- [ ] API health check returns OK
- [ ] Website loads at homesteadarchitect.com
- [ ] Free plan redirects to main app
- [ ] Monthly pricing displays correctly
- [ ] Yearly pricing displays correctly
- [ ] Stripe checkout works for Basic plan
- [ ] Stripe checkout works for Pro plan
- [ ] SSL certificate is active
- [ ] PM2 is running and set to auto-start
- [ ] Nginx is configured correctly

---

## 🎉 **You're Live!**

Your Homestead Architect landing page is now:
- ✅ **Accepting Payments**: Stripe integration fully functional
- ✅ **Acquiring Users**: Free tier removes payment barriers
- ✅ **Professionally Deployed**: Production-ready on OVH VPS
- ✅ **Secure**: SSL enabled with Let's Encrypt
- ✅ **Monitored**: PM2 process management

**Start growing your homestead planning community!** 🌱

---

## 📞 **Need Help?**

If you encounter issues during deployment, check:
1. API logs: `pm2 logs homestead-api`
2. Nginx logs: `tail -f /var/log/nginx/error.log`
3. Browser console for frontend errors
4. Stripe Dashboard for payment issues

Your website is **production-ready** and configured with your actual Stripe Price IDs! 🚀

#!/bin/bash
# Homestead Architect Website - Complete VPS Deployment Script
# Run this on your OVH VPS: vps-5385eb51.vps.ovh.us

set -e  # Exit on any error

echo "🚀 Homestead Architect Website Deployment"
echo "=========================================="
echo ""

# Configuration
DOMAIN="homesteadarchitect.com"
API_DIR="/var/www/homestead-api"
WEB_DIR="/var/www/$DOMAIN"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Please run as root (use sudo)"
    exit 1
fi

echo "📦 Step 1: Creating directories..."
mkdir -p $API_DIR
mkdir -p $WEB_DIR
echo "✅ Directories created"
echo ""

echo "🔧 Step 2: Installing Node.js and PM2..."
# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "Node.js already installed: $(node --version)"
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
else
    echo "PM2 already installed"
fi
echo "✅ Node.js and PM2 ready"
echo ""

echo "📂 Step 3: Deploy API files..."
echo "Please upload these files to $API_DIR:"
echo "  - api/create-checkout-session.js"
echo "  - api/package.json"
echo "  - deploy-api.js"
echo ""
read -p "Press Enter when files are uploaded..."

cd $API_DIR
echo "Installing API dependencies..."
npm install
echo "✅ API files deployed"
echo ""

echo "🔐 Step 4: Configure environment variables..."
cat > $API_DIR/.env << 'EOF'
STRIPE_SECRET_KEY=sk_org_live_0fL8PgbAE9xdc902t0e9v1Rt7bo76Kbi29uc6fX2FA3q97u979r8593BL5CH71q6Xm7xG60H4K37pV6xs3Cj3KE3mq3GT5y15hP3mh70O3qe7T254X3u56CB05F0xg09P3qa1V2aVwcCj8B028R2Mab0J9KYafQ5kag8350D5a9djO6Of0LMgYz9mXel07uVaM4aHU1lF7vh6wB7JDfwOeYn8nF7fK01
PORT=3001
NODE_ENV=production
EOF
chmod 600 $API_DIR/.env
echo "✅ Environment variables configured"
echo ""

echo "🚀 Step 5: Start API with PM2..."
pm2 delete homestead-api 2>/dev/null || true
pm2 start $API_DIR/deploy-api.js --name homestead-api
pm2 startup
pm2 save
echo "✅ API server started"
echo ""

echo "🌐 Step 6: Deploy website files..."
echo "Please upload all files from dist/ folder to $WEB_DIR"
echo ""
read -p "Press Enter when files are uploaded..."

chown -R www-data:www-data $WEB_DIR
chmod -R 755 $WEB_DIR
echo "✅ Website files deployed"
echo ""

echo "⚙️  Step 7: Configure Nginx..."
cat > $NGINX_CONF << 'EOF'
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
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/$DOMAIN

# Test and reload Nginx
nginx -t
systemctl reload nginx
echo "✅ Nginx configured and reloaded"
echo ""

echo "🔒 Step 8: Setting up SSL with Let's Encrypt..."
# Install Certbot if not present
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Get SSL certificate
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || true
echo "✅ SSL certificate configured"
echo ""

echo "🧪 Step 9: Testing deployment..."
echo ""
echo "API Health Check:"
curl -s http://localhost:3001/health || echo "❌ API not responding"
echo ""
echo "Website Check:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://$DOMAIN || echo "❌ Website not responding"
echo ""

echo "✅ Deployment Complete!"
echo ""
echo "═══════════════════════════════════════════"
echo "🎉 Your website is now live!"
echo "═══════════════════════════════════════════"
echo ""
echo "🌐 Website: https://$DOMAIN"
echo "🔧 API Health: https://$DOMAIN/api/health"
echo ""
echo "📊 Monitoring Commands:"
echo "  - Check API status: pm2 status"
echo "  - View API logs: pm2 logs homestead-api"
echo "  - Restart API: pm2 restart homestead-api"
echo "  - Check Nginx: systemctl status nginx"
echo ""
echo "🎯 Next Steps:"
echo "  1. Visit https://$DOMAIN to see your landing page"
echo "  2. Test free tier signup"
echo "  3. Test Stripe checkout with test card: 4242 4242 4242 4242"
echo "  4. Monitor Stripe Dashboard for payment confirmations"
echo ""

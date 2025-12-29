#!/bin/bash
# Configure Nginx for Homestead Architect Landing Page
# Run this script AFTER deploying via GitHub Actions
# Usage: sudo bash configure-nginx.sh

set -e

echo "🔧 Configuring Nginx for homesteadarchitect.com..."

# Create Nginx configuration
cat > /tmp/homesteadarchitect.com << 'EOF'
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

# Install configuration
sudo mv /tmp/homesteadarchitect.com /etc/nginx/sites-available/homesteadarchitect.com
sudo ln -sf /etc/nginx/sites-available/homesteadarchitect.com /etc/nginx/sites-enabled/

# Test configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Reload Nginx
echo "♻️ Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Nginx configured successfully!"
echo ""
echo "🔒 Next: Enable SSL with Let's Encrypt"
echo "Run: sudo certbot --nginx -d homesteadarchitect.com -d www.homesteadarchitect.com"

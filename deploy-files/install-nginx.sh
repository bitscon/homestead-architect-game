#!/bin/bash
# Install nginx configuration on barn.workshop.home
# Run with: sudo bash install-nginx.sh

set -e

echo "🌐 Installing nginx configuration for mybarn.barn.workshop.home..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root: sudo bash install-nginx.sh"
    exit 1
fi

# Check if nginx config exists
if [ ! -f "nginx-mybarn.conf" ]; then
    echo "❌ Error: nginx-mybarn.conf not found"
    exit 1
fi

# Copy to sites-available
echo "📋 Copying config to sites-available..."
cp nginx-mybarn.conf /etc/nginx/sites-available/mybarn.barn.workshop.home

# Create symbolic link
echo "🔗 Creating symbolic link in sites-enabled..."
ln -sf /etc/nginx/sites-available/mybarn.barn.workshop.home /etc/nginx/sites-enabled/

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration is valid"
    
    # Reload nginx
    echo "🔄 Reloading nginx..."
    systemctl reload nginx
    
    echo ""
    echo "✅ Nginx installation complete!"
    echo "🌐 Site available at: https://mybarn.barn.workshop.home"
else
    echo "❌ Nginx configuration test failed"
    echo "Please check the configuration"
    exit 1
fi

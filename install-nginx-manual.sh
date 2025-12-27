#!/bin/bash
# Run this script with sudo
# Example: sudo bash install-nginx-manual.sh

set -e

NGINX_CONFIG="/tmp/nginx-mybarn.conf"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root: sudo bash install-nginx-manual.sh"
    exit 1
fi

# Check if the config file exists
if [ ! -f "$NGINX_CONFIG" ]; then
    echo "❌ Config file not found: $NGINX_CONFIG"
    echo "Please run the previous steps first"
    exit 1
fi

echo "🌐 Installing nginx configuration..."

# Copy to sites-available
echo "Copying config to sites-available..."
cp $NGINX_CONFIG /etc/nginx/sites-available/mybarn.barn.workshop.home

# Create symbolic link
echo "Creating symbolic link in sites-enabled..."
ln -sf /etc/nginx/sites-available/mybarn.barn.workshop.home /etc/nginx/sites-enabled/

# Test nginx configuration
echo "Testing nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration is valid"
    
    # Reload nginx
    echo "Reloading nginx..."
    systemctl reload nginx
    
    echo ""
    echo "✅ Nginx installation complete!"
    echo "🌐 Site available at: https://mybarn.barn.workshop.home"
else
    echo "❌ Nginx configuration test failed"
    echo "Please check the error message above"
    exit 1
fi

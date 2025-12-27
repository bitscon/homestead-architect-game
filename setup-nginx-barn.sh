#!/bin/bash
# Setup nginx configuration for mybarn.barn.workshop.home on barn.workshop.home

set -e

echo "🔧 Setting up nginx for mybarn.barn.workshop.home..."

NGINX_CONFIG_FILE="nginx-mybarn.conf"
REMOTE_HOST="barn.workshop.home"
REMOTE_USER="billybs"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"

# Check if nginx config file exists locally
if [ ! -f "$NGINX_CONFIG_FILE" ]; then
    echo "❌ Error: $NGINX_CONFIG_FILE not found"
    exit 1
fi

echo "📋 Instructions for manual deployment on barn.workshop.home:"
echo ""
echo "1. Copy the nginx config to barn.workshop.home:"
echo "   scp $NGINX_CONFIG_FILE $REMOTE_USER@$REMOTE_HOST:/tmp/"
echo ""
echo "2. SSH into barn.workshop.home:"
echo "   ssh $REMOTE_USER@$REMOTE_HOST"
echo ""
echo "3. Move config to nginx sites-available:"
echo "   sudo mv /tmp/$NGINX_CONFIG_FILE $NGINX_SITES_AVAILABLE/mybarn.barn.workshop.home"
echo ""
echo "4. Create symbolic link to sites-enabled:"
echo "   sudo ln -s $NGINX_SITES_AVAILABLE/mybarn.barn.workshop.home $NGINX_SITES_ENABLED/"
echo ""
echo "5. Test nginx configuration:"
echo "   sudo nginx -t"
echo ""
echo "6. Reload nginx:"
echo "   sudo systemctl reload nginx"
echo ""
echo "7. Verify the site is accessible:"
echo "   curl -k https://mybarn.barn.workshop.home"
echo ""
echo "==========================================="
echo ""

# Try automated deployment if SSH works
echo "🔄 Attempting automated deployment..."
if ssh -o ConnectTimeout=5 $REMOTE_USER@$REMOTE_HOST "echo 'SSH OK'" 2>/dev/null; then
    echo "✅ SSH connection successful, proceeding with deployment..."
    
    # Copy config file
    scp $NGINX_CONFIG_FILE $REMOTE_USER@$REMOTE_HOST:/tmp/
    
    # Deploy on remote server
    ssh $REMOTE_USER@$REMOTE_HOST << 'ENDSSH'
        echo "📦 Installing nginx configuration..."
        sudo mv /tmp/nginx-mybarn.conf /etc/nginx/sites-available/mybarn.barn.workshop.home
        
        echo "🔗 Creating symbolic link..."
        sudo ln -sf /etc/nginx/sites-available/mybarn.barn.workshop.home /etc/nginx/sites-enabled/
        
        echo "🧪 Testing nginx configuration..."
        if sudo nginx -t; then
            echo "✅ Nginx config is valid"
            echo "🔄 Reloading nginx..."
            sudo systemctl reload nginx
            echo "✅ Nginx reloaded successfully"
        else
            echo "❌ Nginx config test failed"
            exit 1
        fi
ENDSSH
    
    echo ""
    echo "✅ Deployment complete!"
    echo "🌐 Site should be accessible at: https://mybarn.barn.workshop.home"
else
    echo "⚠️  SSH connection failed. Please follow manual instructions above."
fi

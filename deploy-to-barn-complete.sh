#!/bin/bash
# Complete deployment script for Homestead Architect on barn.workshop.home
# This deploys both the Docker container and nginx configuration

set -e

REMOTE_HOST="barn.workshop.home"
REMOTE_USER="billybs"
REMOTE_PATH="/opt/apps/homestead-architect"
LOCAL_PATH="/home/billybs/apps/homestead-architect"

echo "🚀 Deploying Homestead Architect to barn.workshop.home..."
echo ""

# Step 1: Create remote directory
echo "📁 Creating remote directory..."
ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_PATH"

# Step 2: Sync project files
echo "📦 Syncing project files to barn.workshop.home..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' \
    $LOCAL_PATH/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/

# Step 3: Copy environment file
echo "⚙️  Setting up environment..."
scp $LOCAL_PATH/.env.barn $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/.env

# Step 4: Deploy Docker containers
echo "🐳 Starting Docker containers on barn.workshop.home..."
ssh $REMOTE_USER@$REMOTE_HOST << 'ENDSSH'
cd /opt/apps/homestead-architect
docker compose --profile dev down 2>/dev/null || true
docker compose --profile dev up -d --build
echo "✅ Docker containers started"
ENDSSH

# Step 5: Install nginx configuration
echo "🌐 Installing nginx configuration..."
scp $LOCAL_PATH/nginx-mybarn.conf $REMOTE_USER@$REMOTE_HOST:/tmp/
ssh $REMOTE_USER@$REMOTE_HOST << 'ENDSSH'
sudo mv /tmp/nginx-mybarn.conf /etc/nginx/sites-available/mybarn.barn.workshop.home
sudo ln -sf /etc/nginx/sites-available/mybarn.barn.workshop.home /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
echo "✅ Nginx configured and reloaded"
ENDSSH

echo ""
echo "✅ Deployment complete!"
echo "🌐 Application available at: https://mybarn.barn.workshop.home"
echo ""
echo "📊 Verify deployment:"
echo "  ssh $REMOTE_USER@$REMOTE_HOST 'docker ps | grep homestead'"
echo "  curl -k https://mybarn.barn.workshop.home"

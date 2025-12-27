#!/bin/bash
# Deploy Homestead Architect to barn.workshop.home

set -e

echo "🚀 Deploying Homestead Architect to barn.workshop.home..."

# Configuration
REMOTE_HOST="barn.workshop.home"
REMOTE_USER="billybs"
REMOTE_PATH="/opt/apps/homestead-architect"
ENV_FILE=".env.barn"

# Check if SSH connection works
echo "📡 Testing SSH connection to $REMOTE_HOST..."
if ! ssh -o ConnectTimeout=5 $REMOTE_USER@$REMOTE_HOST "echo 'SSH connection successful'"; then
    echo "❌ SSH connection failed. Please set up SSH keys first."
    echo "Run: ssh-copy-id $REMOTE_USER@$REMOTE_HOST"
    exit 1
fi

# Sync files to remote server
echo "📦 Syncing files to $REMOTE_HOST..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' \
    ./ $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/

# Copy environment file
echo "⚙️  Copying environment configuration..."
scp $ENV_FILE $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/.env

# Deploy via Docker Compose on remote server
echo "🐳 Deploying with Docker Compose..."
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && \
    docker compose --profile dev down && \
    docker compose --profile dev up -d --build"

echo "✅ Deployment complete!"
echo "🌐 Application should be available at: https://mybarn.barn.workshop.home"
echo "📊 Check Portainer for container status"

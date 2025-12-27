#!/bin/bash
# Manual deployment script - transfer this to barn.workshop.home and run

set -e

echo "🚀 Manual Deployment Script for Homestead Architect"
echo "This script creates all deployment files locally that you can transfer to barn.workshop.home"
echo ""

# Create deployment directory
DEPLOY_DIR="/home/billybs/apps/homestead-architect/deploy-files"
mkdir -p $DEPLOY_DIR

echo "📦 Preparing deployment files..."

# Copy all necessary files
cp docker-compose.yml $DEPLOY_DIR/
cp Dockerfile.dev $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp .env.barn $DEPLOY_DIR/
cp nginx-mybarn.conf $DEPLOY_DIR/
cp DEPLOY-ON-BARN.sh $DEPLOY_DIR/
cp install-nginx.sh $DEPLOY_DIR/

# Create deployment package
cd $DEPLOY_DIR
tar -czf ../homestead-manual-deployment.tar.gz \
    --exclude='*.tar.gz' \
    .

echo ""
echo "✅ Deployment package created: homestead-manual-deployment.tar.gz"
echo "📍 Location: /home/billybs/apps/homestead-architect/homestead-manual-deployment.tar.gz"
echo ""
echo "📋 Next Steps:"
echo "1. Transfer homestead-manual-deployment.tar.gz to barn.workshop.home"
echo "2. Extract on barn.workshop.home: tar -xzf homestead-manual-deployment.tar.gz"
echo "3. Run: bash DEPLOY-ON-BARN.sh"
echo "4. Install nginx: sudo bash install-nginx.sh"
echo "5. Test: https://mybarn.barn.workshop.home"
echo ""
ls -lh ../homestead-manual-deployment.tar.gz

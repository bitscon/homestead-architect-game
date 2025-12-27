#!/bin/bash
# Run this script ON barn.workshop.home after extracting files
# Location: /opt/apps/homestead-architect

set -e

echo "🚀 Deploying Homestead Architect on barn.workshop.home..."
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found"
    echo "Please run this script from /opt/apps/homestead-architect"
    exit 1
fi

# Check if .env exists, if not copy from .env.barn
if [ ! -f ".env" ]; then
    echo "📋 Creating .env from .env.barn..."
    cp .env.barn .env
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker compose --profile dev down 2>/dev/null || true

# Build and start containers
echo "🐳 Building and starting Docker containers..."
docker compose --profile dev up -d --build

# Wait for containers to be healthy
echo "⏳ Waiting for containers to start..."
sleep 10

# Check status
echo ""
echo "📊 Container Status:"
docker compose --profile dev ps

# Test local access
echo ""
echo "🧪 Testing local access..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8081 | grep -q "200"; then
    echo "✅ Application responding on port 8081"
else
    echo "⚠️  Application may still be starting..."
fi

echo ""
echo "✅ Docker deployment complete!"
echo ""
echo "Next steps:"
echo "1. Install nginx config: sudo bash /opt/apps/homestead-architect/install-nginx.sh"
echo "2. Access via: https://mybarn.barn.workshop.home"
echo "3. Check Portainer: http://barn.workshop.home:9000"

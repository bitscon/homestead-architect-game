# Homestead Architect - Deployment Playbook

This document provides complete instructions for deploying Homestead Architect in both development and production environments using Docker Swarm and Portainer.

## Overview

- **Development**: Full stack with local database, hot reload, and debugging tools
- **Production**: Frontend-only stack using external Supabase backend
- **Infrastructure**: Docker Swarm with Portainer management
- **Repository**: All files in this repo; no external scripts required

## Prerequisites

### Common Requirements
- Docker Engine 20.10+ with Swarm mode enabled
- Portainer (recommended) for stack management
- Git access to this repository
- Container registry access (production)

### Enable Docker Swarm
```bash
# Initialize Swarm on manager node
docker swarm init

# Or join existing cluster
docker swarm join --token <TOKEN> <MANAGER_IP>:2377
```

## Environment Configuration

### Development Environment (.env.dev)
```bash
# Copy template and configure
cp .env.example .env.dev

# Required variables
VITE_SUPABASE_URL=http://localhost:5432  # or your dev Supabase
VITE_SUPABASE_ANON_KEY=your_dev_anon_key
DEV_IMAGE=homestead-architect-dev:latest
DEV_WEB_PORT=8081

# Database (if using local PostgreSQL)
POSTGRES_DB=homestead_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

# PgAdmin (optional)
PGADMIN_DEFAULT_EMAIL=admin@homestead.local
PGADMIN_DEFAULT_PASSWORD=admin
PGADMIN_PORT=5050
```

### Production Environment (.env.prod)
```bash
# Copy template and configure
cp .env.prod.example .env.prod

# Required variables
PROD_IMAGE=your-registry.com/homestead-architect-prod:latest
PROD_WEB_PORT=8080
VITE_SUPABASE_URL=https://supabase.bitscon.net
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # for validation
```

## Development Deployment

### Option 1: Portainer (Recommended)
1. Access Portainer web interface
2. Navigate to **Stacks** → **Add stack**
3. Set stack name: `homestead-architect-dev`
4. Select **Web editor** and paste contents of `stack.dev.yml`
5. Configure environment variables from `.env.dev`
6. Click **Deploy the stack**

### Option 2: CLI
```bash
# Deploy development stack
docker stack deploy -c stack.dev.yml homestead-architect-dev

# View stack status
docker service ls | grep homestead-architect-dev
```

### Development Services
- **Frontend**: `http://localhost:8081` (Vite dev server with hot reload)
- **PostgreSQL**: `localhost:5432` (optional)
- **PgAdmin**: `http://localhost:5050` (optional)

### Development Workflow
1. Make code changes locally
2. Changes are automatically synced via volume mount
3. Browser auto-refreshes with hot reload
4. Debug tools available in browser dev tools

## Production Deployment

### 1. Build Production Image
```bash
# Set variables
export REGISTRY_URL=your-registry.com
export VERSION=v1.0.0
export FULL_IMAGE_TAG=${REGISTRY_URL}/homestead-architect-prod:${VERSION}

# Build optimized production image
docker build -f Dockerfile -t ${FULL_IMAGE_TAG} .

# Push to registry
docker push ${FULL_IMAGE_TAG}
```

### 2. Validate Production Environment
```bash
# Test Supabase connectivity
node scripts/validate-supabase-prod.mjs

# Validate stack file syntax
docker stack config -c stack.prod.yml
```

### 3. Deploy Production Stack

#### Option 1: Portainer (Recommended)
1. Access Portainer web interface
2. Navigate to **Stacks** → **Add stack**
3. Set stack name: `homestead-architect-prod`
4. Select **Web editor** and paste contents of `stack.prod.yml`
5. Configure environment variables:
   - `PROD_IMAGE=${FULL_IMAGE_TAG}`
   - `PROD_WEB_PORT=8080`
   - `VITE_SUPABASE_URL=https://supabase.bitscon.net`
   - `VITE_SUPABASE_ANON_KEY=your_production_anon_key`
6. Click **Deploy the stack**

#### Option 2: CLI
```bash
# Set environment variables
export PROD_IMAGE=${FULL_IMAGE_TAG}
export PROD_WEB_PORT=8080

# Deploy production stack
docker stack deploy -c stack.prod.yml homestead-architect-prod
```

### 4. Production Verification
```bash
# Check service status
docker service ls | grep homestead-architect-prod
docker service ps homestead-architect-prod_frontend

# Test accessibility
curl -I http://localhost:8080

# Monitor logs
docker service logs homestead-architect-prod_frontend --tail=50
```

## Stack Management

### View Stack Status
```bash
# List all stacks
docker stack ls

# List services in stack
docker service ls | grep homestead-architect

# Service details
docker service inspect homestead-architect-prod_frontend
```

### Update Stack
1. **Via Portainer**: Edit the stack and click "Update the stack"
2. **Via CLI**: Re-run the deploy command with updated environment

```bash
# Update with new image
export PROD_IMAGE=your-registry.com/homestead-architect-prod:v1.1.0
docker stack deploy -c stack.prod.yml homestead-architect-prod
```

### Scale Services
```bash
# Scale production frontend
docker service scale homestead-architect-prod_frontend=3
```

### Remove Stack
```bash
# Remove entire stack
docker stack rm homestead-architect-prod
```

## Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check service logs
docker service logs homestead-architect-prod_frontend

# Check for placement errors
docker service ps homestead-architect-prod_frontend

# Inspect service configuration
docker service inspect homestead-architect-prod_frontend
```

#### Database Connection Issues
```bash
# Run Supabase validation
node scripts/validate-supabase-prod.mjs

# Test network connectivity
docker run --rm --network homestead-architect-prod_homestead-network \
  alpine ping supabase.bitscon.net
```

#### Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :8080

# Update port in environment
export PROD_WEB_PORT=8081
docker stack deploy -c stack.prod.yml homestead-architect-prod
```

### Debug Mode (Development Only)
The development environment includes comprehensive debugging:

1. **Debug Panel**: Available in browser dev tools
2. **Console Logging**: All console calls are captured and stored
3. **Network Telemetry**: API calls and responses are logged
4. **Error Tracking**: Unhandled errors and promise rejections
5. **Persistent Logs**: Available in localStorage and downloadable

Access debug logs:
```javascript
// In browser console
window.__debugLogger.getLogs()    // Get all logs
window.__debugLogger.downloadLogs()  // Download as JSONL
```

## Monitoring

### Container Health
```bash
# Service health status
docker service ls

# Container resource usage
docker stats

# Node availability
docker node ls
```

### Log Management
```bash
# Real-time logs
docker service logs -f homestead-architect-prod_frontend

# Export logs
docker service logs homestead-architect-prod_frontend > production.log

# Filter logs by time
docker service logs --since=1h homestead-architect-prod_frontend
```

### Performance Monitoring
- Monitor container memory and CPU usage
- Check response times via application logs
- Use browser dev tools for frontend performance
- Set up external monitoring (Prometheus/Grafana) if needed

## Security Considerations

### Environment Variables
- Never commit `.env.dev` or `.env.prod` to version control
- Use separate values for development and production
- Rotate Supabase keys regularly
- Store secrets in proper secret management systems

### Container Security
```bash
# Scan images for vulnerabilities
docker scan your-registry.com/homestead-architect-prod:latest

# Use non-root users (configured in Dockerfile)
# Implement resource limits (configured in stack files)
```

### Network Security
- Production stack only exposes necessary ports
- Use HTTPS in production (reverse proxy)
- Implement proper CORS headers
- Consider network policies for multi-tenant environments

## Backup and Recovery

### Database Backup (Supabase)
- Use Supabase built-in backup features
- Export critical data regularly
- Test restore procedures

### Application Backup
```bash
# Export stack configuration
docker stack config -c stack.prod.yml > stack-backup.yml

# Save environment files (securely)
# Commit stack files to version control
```

### Disaster Recovery
1. Restore Supabase database
2. Rebuild and push container images
3. Redeploy stacks using saved configurations
4. Validate application functionality

## Rollback Procedures

### Quick Rollback
```bash
# Revert to previous image version
export PROD_IMAGE=your-registry.com/homestead-architect-prod:v1.0.0
docker stack deploy -c stack.prod.yml homestead-architect-prod
```

### Full Rollback
```bash
# Remove current stack
docker stack rm homestead-architect-prod

# Wait for cleanup
sleep 30

# Deploy previous version
export PROD_IMAGE=your-registry.com/homestead-architect-prod:v0.9.0
docker stack deploy -c stack.prod.yml homestead-architect-prod
```

## Continuous Deployment

### CI/CD Pipeline Integration
```bash
# Example deployment script
#!/bin/bash
set -e

# Variables
VERSION=$1
REGISTRY=your-registry.com
IMAGE_TAG=${REGISTRY}/homestead-architect-prod:${VERSION}

# Build and push
docker build -f Dockerfile -t ${IMAGE_TAG} .
docker push ${IMAGE_TAG}

# Deploy
export PROD_IMAGE=${IMAGE_TAG}
docker stack deploy -c stack.prod.yml homestead-architect-prod

# Verify
sleep 30
curl -f http://localhost:8080 || exit 1
```

### Automated Testing
- Run Supabase validation before deployment
- Implement smoke tests after deployment
- Set up automated rollback on failure
- Monitor deployment success rates

## Support

### Documentation
- Check this playbook first
- Review stack file configurations
- Consult application logs for errors

### Common Resources
- [Docker Swarm Documentation](https://docs.docker.com/engine/swarm/)
- [Portainer Documentation](https://docs.portainer.io/)
- [Supabase Documentation](https://supabase.com/docs)

### Contact
- Repository maintainers: Use GitHub issues
- Infrastructure support: Contact your DevOps team
- Application bugs: File issues in the project repository
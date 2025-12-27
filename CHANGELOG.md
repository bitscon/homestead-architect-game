# Changelog

All notable changes to the Homestead Architect deployment infrastructure will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2025-12-26

### Changed - Deployment Infrastructure Overhaul

#### Migration from Docker Swarm to Docker Compose
- **Switched orchestration method** from Docker Swarm to Docker Compose for simpler single-server deployment
- Removed Docker Swarm dependencies and stack files (`stack.dev.yml`, `stack.prod.yml` are now legacy)
- Updated all deployment scripts to use `docker-compose` commands instead of `docker stack`
- Simplified production deployment workflow for single-server architecture

#### Port Configuration Updates
- **Changed production port** from 8081 to 8082 to resolve conflict with Supabase Kong service
- Updated `docker-compose.yml` production service port mapping: `8082:80`
- Fixed nginx container port mapping (was incorrectly pointing to Vite port 5173)
- Updated all health check endpoints to use port 8082
- Updated documentation to reflect new port configuration

#### GitHub Container Registry Integration
- **Implemented GitHub Container Registry (GHCR)** for centralized Docker image storage
- Added `build-and-push` job to GitHub Actions workflow
- Configured automatic image tagging with git SHA and `latest` tag
- Images now stored at: `ghcr.io/bitscon/homestead-architect-game`
- Eliminated on-server image building (faster deployments)
- Proper image versioning and rollback support

#### GitHub Actions Workflow Improvements
- **Split deployment workflow** into two jobs: `build-and-push` and `deploy`
- Added GHCR authentication using `GITHUB_TOKEN`
- Added `sudo` prefix to all Docker commands (fixes permission denied errors on production server)
- Updated deployment script to pull pre-built images from GHCR instead of building on server
- Improved health check validation on port 8082
- Enhanced error reporting and troubleshooting guidance
- Updated success/failure messages with correct URLs and next steps

#### Environment Variable Management
- **Added `VITE_APP_URL`** environment variable for proper application URL configuration
- Set production URL to: `https://myhome.homesteadarchitect.com`
- Added `NODE_ENV=production` to Docker Compose production service
- Updated `.env.prod.example` with all required variables and proper port
- Improved environment variable documentation in all guides

#### URL Structure Changes
- **Main application URL**: `https://myhome.homesteadarchitect.com` (port 8082 proxied via Plesk)
- **Static homepage**: `https://homesteadarchitect.com` (separate service)
- **Admin routes**: Will be subdirectory of main app (`/admin`)
- Updated all documentation to reflect new URL structure

#### Documentation Updates
- **Updated `DEPLOYMENT_GUIDE.md`**: Complete rewrite with Docker Compose approach
  - Replaced all Docker Swarm references with Docker Compose commands
  - Updated port references from 8080/8081 to 8082
  - Added GHCR integration documentation
  - Updated troubleshooting section with new commands
  - Added rollback procedures for GHCR images
  
- **Updated `DEPLOYMENT_PLAYBOOK.md`**: Quick reference for Docker Compose deployment
  - Removed Portainer and Swarm references
  - Added GitHub Actions deployment steps
  - Updated manual deployment procedures
  - Simplified for single-server architecture
  
- **Updated `README.md`**: Modernized with current deployment info
  - Changed prerequisites (removed Swarm, added Compose)
  - Updated production deployment section
  - Added live application URLs
  - Updated documentation references

- **Created `CHANGELOG.md`**: This file, documenting all infrastructure changes

### Fixed
- **Docker permission errors** on production server (added sudo to all commands)
- **Port conflict** with existing Supabase Kong service on port 8081
- **Incorrect nginx port mapping** in production service (5173 → 80)
- **Missing environment variables** for application URL configuration
- **GitHub Actions SSH authentication** issues with Docker daemon

### Added
- GitHub Container Registry (GHCR) integration
- Automated image building and pushing in CI/CD pipeline
- Proper image versioning with git SHA tags
- `VITE_APP_URL` environment variable
- `NODE_ENV=production` to production Docker Compose service
- `restart: unless-stopped` policy for production container
- Comprehensive rollback procedures using GHCR images
- Health check validation on port 8082

### Removed
- Docker Swarm initialization requirements
- On-server Docker image building (now uses GHCR)
- Portainer management interface references (optional now)
- Legacy stack files from active use (kept for reference)

## [1.0.0] - 2025-12-25

### Initial Release
- Basic Docker Swarm deployment setup
- GitHub Actions deployment workflow
- Supabase integration
- React + TypeScript + Vite application
- shadcn/ui component library
- Gamification features

---

## Migration Guide: Swarm to Compose

If you have an existing Docker Swarm deployment, follow these steps:

### On Production Server (bitscon.net)

```bash
# 1. Stop and remove old Swarm stack
docker stack rm homestead-architect-prod
sleep 30

# 2. Leave swarm mode (if not using it for other services)
docker swarm leave --force

# 3. Update repository
cd /opt/apps/homestead-architect
git pull origin main

# 4. Update .env.prod file
nano .env.prod
# Add: PROD_WEB_PORT=8082
# Add: VITE_APP_URL=https://myhome.homesteadarchitect.com

# 5. Pull latest image
sudo docker pull ghcr.io/bitscon/homestead-architect-game:latest

# 6. Deploy with Docker Compose
sudo docker-compose -f docker-compose.yml --profile production up -d

# 7. Verify
curl http://localhost:8082
sudo docker-compose -f docker-compose.yml --profile production ps
```

### Configure Plesk Proxy

In Plesk, set up subdomain routing:
- **Subdomain**: `myhome.homesteadarchitect.com`
- **Proxy Pass**: `http://localhost:8082`
- **SSL**: Enable Let's Encrypt certificate

---

## Support

For issues or questions about deployment:
- Check `DEPLOYMENT_GUIDE.md` for detailed troubleshooting
- Review GitHub Actions workflow logs
- SSH to server and check Docker Compose logs

**Deployment Status:** ✅ Ready for Production  
**Last Tested:** December 26, 2025  
**Maintained By:** billybs

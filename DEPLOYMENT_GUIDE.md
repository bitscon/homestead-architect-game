# Homestead Architect - Complete Deployment Guide

**Last Updated:** December 26, 2025  
**Status:** ✅ Updated with GHCR & Docker Compose

**Recent Changes:**
- Switched from Docker Swarm to Docker Compose for production
- Integrated GitHub Container Registry (GHCR) for image storage
- Changed production port from 8081 to 8082 (Supabase Kong conflict resolution)
- Added subdomain support for `myhome.homesteadarchitect.com`

---

## Table of Contents

1. [Overview](#overview)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Development Workflow](#development-workflow)
4. [Production Deployment](#production-deployment)
5. [Troubleshooting](#troubleshooting)
6. [Reusable Pattern](#reusable-pattern)

---

## Overview

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│  DEVELOPMENT (barn.workshop.home)                       │
│  ├─ ~/apps/homestead-architect/                         │
│  ├─ Docker Compose for testing                          │
│  ├─ Nginx proxy                                         │
│  └─ Access: http://homestead-architect.barn.workshop.home│
└─────────────────────────────────────────────────────────┘
                      ↓ git push
┌─────────────────────────────────────────────────────────┐
│  GITHUB (bitscon/homestead-architect-game)              │
│  ├─ Source code repository                              │
│  ├─ GitHub Actions workflow                             │
│  ├─ GitHub Container Registry (GHCR)                    │
│  └─ Manual deployment trigger                           │
└─────────────────────────────────────────────────────────┘
          ↓ build & push image    ↓ SSH deploy & pull image
┌─────────────────────────────────────────────────────────┐
│  PRODUCTION (vps-5385eb51.vps.ovh.us / bitscon.net)     │
│  ├─ OVH VPS at 15.204.225.161                           │
│  ├─ /opt/apps/homestead-architect/                      │
│  ├─ Docker Compose (production profile)                 │
│  ├─ Port 8082 → Plesk proxy → myhome.homesteadarchitect.com│
│  ├─ Existing Supabase stack (ports 8081, 5432, etc.)    │
│  └─ Access: https://myhome.homesteadarchitect.com       │
└─────────────────────────────────────────────────────────┘
```

### Deployment Flow

1. **Develop** on barn.workshop.home or locally
2. **Commit & Push** to GitHub main branch
3. **GitHub Actions** builds Docker image and pushes to GHCR
4. **Deploy** via GitHub Actions UI (manual trigger, type "deploy")
5. **Production server** pulls image from GHCR and deploys with Docker Compose (`--profile production`)
6. **Live** at https://myhome.homesteadarchitect.com (via Plesk proxy)

### Docker Compose Profiles

Homestead Architect uses Docker Compose profiles to manage different environments:

| Profile | Services Started | Use Case |
|---------|-----------------|----------|
| `dev` | `frontend-dev`, `postgres` | Local development with hot reload |
| `production` | `frontend-prod` | Production deployment (port 8082) |
| `tools` | `pgadmin` | Database administration |

**Examples:**
```bash
# Development environment
docker-compose --profile dev up -d

# Production environment (no postgres to avoid port conflicts)
docker-compose --profile production up -d

# Database admin tools
docker-compose --profile tools up -d

# Multiple profiles
docker-compose --profile dev --profile tools up -d
```

**Important:** Production profile ONLY starts `frontend-prod` to prevent port 5432 conflicts with existing Supabase PostgreSQL on production server.

---

## Infrastructure Setup

### Prerequisites

**On barn.workshop.home:**
- Docker installed and running
- Docker Swarm initialized
- Nginx installed
- Git configured
- Node.js 20+ and npm

**Production VPS (vps-5385eb51.vps.ovh.us):**
- **Hostname**: `vps-5385eb51.vps.ovh.us` (OVH VPS)
- **DNS Alias**: `bitscon.net` → 15.204.225.161
- **User**: `billybs`
- **Docker**: 20.10.24+ with Compose 1.29.2+
- **Plesk**: Installed for proxy management
- **SSH Access**: Port 22, key-based authentication
- **Domains**: 
  - `homesteadarchitect.com` (static homepage)
  - `myhome.homesteadarchitect.com` (application portal - port 8082)
  - `supabase.bitscon.net` (Supabase instance)
- **Existing Services**: 
  - Port 8081: Supabase Kong
  - Port 5432: PostgreSQL/Supavisor
  - Port 6543: Supabase Pooler
  - Port 4000: Analytics
  - Port 5678: n8n
  - Port 11434: Ollama

### One-Time Setup Tasks

#### 1. Development Server (barn.workshop.home)

```bash
# Create apps directory
mkdir -p ~/apps

# Clone repository
cd ~/apps
git clone https://github.com/bitscon/homestead-architect-game.git homestead-architect
cd homestead-architect

# Create development environment file
cp .env.example .env.dev

# Edit with your development Supabase credentials
nano .env.dev
```

**Example .env.dev:**
```env
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key
VITE_APP_NAME=Homestead Architect (Dev)
VITE_SHOW_GAME_DEBUG=true
DEV_WEB_PORT=8081
```

#### 2. Production Server

```bash
# SSH to production (use either hostname or DNS alias)
ssh billybs@vps-5385eb51.vps.ovh.us
# OR
ssh billybs@bitscon.net

# Create apps directory
sudo mkdir -p /opt/apps
sudo chown $USER:$USER /opt/apps

# Clone repository
cd /opt/apps
git clone https://github.com/bitscon/homestead-architect-game.git homestead-architect
cd homestead-architect

# Create production environment file
cp .env.prod.example .env.prod

# Edit with your PRODUCTION Supabase credentials
nano .env.prod
```

**Example .env.prod:**
```env
# Application Settings
NODE_ENV=production
PROD_WEB_PORT=8082
VITE_APP_NAME=Homestead Architect
VITE_APP_URL=https://myhome.homesteadarchitect.com

# Supabase Configuration
VITE_SUPABASE_URL=https://supabase.bitscon.net
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Debug
VITE_SHOW_GAME_DEBUG=false
```

**⚠️ IMPORTANT: Never commit .env.prod to GitHub!**

#### 3. GitHub Secrets Setup

Generate SSH key for GitHub Actions:

```bash
# On barn.workshop.home (or any machine)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy

# Copy public key to production server
ssh-copy-id -i ~/.ssh/github_deploy.pub user@bitscon.net

# Test SSH access
ssh -i ~/.ssh/github_deploy user@bitscon.net "echo 'SSH works!'"
```

**Add secrets to GitHub repository:**

Go to: `https://github.com/bitscon/homestead-architect-game/settings/secrets/actions`

Create these secrets:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `PROD_HOST` | Production server hostname | `vps-5385eb51.vps.ovh.us` or `bitscon.net` |
| `PROD_USER` | SSH username on production | `billybs` |
| `SSH_PRIVATE_KEY` | Content of `~/.ssh/github_deploy` | (entire private key file) |
| `PROD_APP_PATH` | Path to app on production | `/opt/apps/homestead-architect` |

**How to get SSH_PRIVATE_KEY value:**
```bash
cat ~/.ssh/github_deploy
# Copy entire output including "-----BEGIN" and "-----END" lines
```

---

## Development Workflow

### Daily Development Cycle

```bash
# On barn.workshop.home
cd ~/apps/homestead-architect

# 1. Update from GitHub
git pull origin main

# 2. Create feature branch (optional but recommended)
git checkout -b feature/my-new-feature

# 3. Make code changes...
# Edit files in src/, components/, etc.

# 4. Test locally
npm run dev
# Access at http://localhost:5173

# 5. Test with Docker Compose (optional)
docker-compose up -d
# Access at http://localhost:8081

# 6. Commit changes
git add .
git commit -m "feat: Add new feature description"

# 7. Push to GitHub
git push origin feature/my-new-feature

# 8. Create Pull Request on GitHub
# feature/my-new-feature → main

# 9. Review and merge PR
# (Or merge directly if you're solo)
git checkout main
git merge feature/my-new-feature
git push origin main

# 10. Deploy (see next section)
```

### Local Testing Options

**Option 1: Vite Dev Server (Fastest)**
```bash
cd ~/apps/homestead-architect
npm install  # First time only
npm run dev
# Access at http://localhost:5173
```

**Option 2: Docker Compose (Production-like)**
```bash
cd ~/apps/homestead-architect

# Development environment with postgres
docker-compose --profile dev up -d
# Access at http://localhost:8081

# Or without local postgres (use external Supabase only)
docker-compose up -d frontend-dev
```

**Option 3: Nginx Proxy (Domain-like)**
```bash
# Configure Nginx (one-time)
sudo nano /etc/nginx/sites-available/homestead-architect.conf
```

Add:
```nginx
server {
    listen 80;
    server_name homestead-architect.barn.workshop.home;

    location / {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/homestead-architect.conf \
            /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Access at http://homestead-architect.barn.workshop.home
```

---

## Production Deployment

### Method 1: GitHub Actions UI (Recommended)

**Step-by-Step:**

1. **Ensure code is on main branch**
   ```bash
   git checkout main
   git push origin main
   ```

2. **Go to GitHub Actions**
   - Navigate to: `https://github.com/bitscon/homestead-architect-game/actions`
   - Click on **"Deploy to Production"** workflow

3. **Run workflow**
   - Click **"Run workflow"** button (top right)
   - Select branch: `main`
   - Confirm deploy: Type `deploy`
   - Log level: Choose `info` or `debug`
   - Click **"Run workflow"** (green button)

4. **Monitor deployment**
   - Watch real-time logs in the Actions tab
   - Deployment typically takes 2-3 minutes

5. **Verify deployment**
   - Access: `https://myhome.homesteadarchitect.com`
   - Check functionality
   - Verify Supabase integration works

**Deployment Timeline:**
- Build Docker image: ~90-120 seconds
- Push to GHCR: ~30-45 seconds
- Deploy (pull + up): ~60 seconds
- Health check: ~15 seconds
- **Total: ~3-4 minutes**

### Method 2: Manual SSH Deployment (Fallback)

If GitHub Actions is unavailable:

```bash
# SSH to production
ssh billybs@bitscon.net

# Navigate to app directory
cd /opt/apps/homestead-architect

# Pull latest code
git fetch origin
git checkout main
git pull origin main

# Pull latest Docker image from GHCR (if already built)
sudo docker pull ghcr.io/bitscon/homestead-architect-game:latest

# Or build locally if needed
sudo docker build -t ghcr.io/bitscon/homestead-architect-game:latest -f Dockerfile .

# Deploy with Docker Compose
sudo docker-compose -f docker-compose.yml --profile production down
sudo docker-compose -f docker-compose.yml --profile production up -d

# Wait for service to start
sleep 15

# Check status
sudo docker-compose -f docker-compose.yml --profile production ps

# Verify
curl http://localhost:8082
```

### Rollback Procedure

If deployment fails or causes issues:

**Option 1: Rollback to previous GHCR image**
```bash
# SSH to production
ssh billybs@bitscon.net
cd /opt/apps/homestead-architect

# Find previous image tag
sudo docker images | grep ghcr.io/bitscon/homestead-architect-game

# Pull specific previous version (replace prod-abc1234 with actual tag)
sudo docker pull ghcr.io/bitscon/homestead-architect-game:prod-abc1234

# Update docker-compose to use that tag temporarily, or:
# Stop current deployment
sudo docker-compose -f docker-compose.yml --profile production down

# Start with previous image
sudo docker tag ghcr.io/bitscon/homestead-architect-game:prod-abc1234 ghcr.io/bitscon/homestead-architect-game:latest
sudo docker-compose -f docker-compose.yml --profile production up -d

# Verify
curl http://localhost:8082
```

**Option 2: Rollback via git**
```bash
# SSH to production
ssh billybs@bitscon.net
cd /opt/apps/homestead-architect

# Rollback code
git log --oneline -5  # Find previous commit
git checkout <previous-commit-hash>

# Rebuild and deploy
sudo docker build -t ghcr.io/bitscon/homestead-architect-game:latest -f Dockerfile .
sudo docker-compose -f docker-compose.yml --profile production up -d --force-recreate
```

**Rollback time: ~1-2 minutes**

---

## Troubleshooting

### Common Issues

#### 1. GitHub Actions: "SSH connection failed"

**Symptoms:**
```
Error: dial tcp: lookup bitscon.net: no such host
```

**Solutions:**
- Verify `PROD_HOST` secret is correct
- Test SSH manually: `ssh user@bitscon.net`
- Check server is online and accessible
- Verify firewall allows SSH (port 22)

#### 2. GitHub Actions: "Permission denied (publickey)"

**Symptoms:**
```
Permission denied (publickey)
```

**Solutions:**
- Verify `SSH_PRIVATE_KEY` secret contains full private key
- Ensure public key is in `~/.ssh/authorized_keys` on production
- Test key manually: `ssh -i ~/.ssh/github_deploy user@bitscon.net`
- Check file permissions on production: `chmod 600 ~/.ssh/authorized_keys`

#### 3. Docker Compose deployment fails

**Symptoms:**
```
ERROR: Cannot start service frontend-prod: port is already allocated
```

**Solutions:**
```bash
# Check port availability
sudo netstat -tulpn | grep 8082

# Check if old containers are still running
sudo docker ps -a | grep homestead

# Stop and remove old containers
sudo docker-compose -f docker-compose.yml --profile production down
sudo docker ps -a | grep homestead | awk '{print $1}' | xargs sudo docker rm -f

# Try deployment again
sudo docker-compose -f docker-compose.yml --profile production up -d
```

#### 4. Container won't start

**Symptoms:**
```
Container exits immediately or shows "Exited (1)"
```

**Solutions:**
```bash
# Check logs
sudo docker-compose -f docker-compose.yml --profile production logs frontend-prod

# Common issues:
# - Missing environment variables
# - Port conflict (check 8082)
# - Image build failed
# - Nginx configuration error

# Verify environment file exists
ls -la /opt/apps/homestead-architect/.env.prod
cat /opt/apps/homestead-architect/.env.prod | grep VITE_

# Check port availability (should be free)
sudo netstat -tlnp | grep 8082

# Rebuild image if needed
cd /opt/apps/homestead-architect
sudo docker build -t ghcr.io/bitscon/homestead-architect-game:latest -f Dockerfile .
```

#### 5. Application accessible but broken

**Symptoms:**
- Page loads but API calls fail
- Supabase errors in browser console

**Solutions:**
```bash
# Verify environment variables in running container
sudo docker-compose -f docker-compose.yml --profile production config | grep VITE_

# Check .env.prod has correct Supabase URL and keys
ssh billybs@bitscon.net
cd /opt/apps/homestead-architect
cat .env.prod | grep VITE_SUPABASE

# Update and redeploy
sudo docker-compose -f docker-compose.yml --profile production up -d --force-recreate
```

### Debug Commands

**Check container status:**
```bash
sudo docker-compose -f docker-compose.yml --profile production ps
sudo docker ps | grep homestead
```

**View logs:**
```bash
# Last 100 lines
sudo docker-compose -f docker-compose.yml --profile production logs --tail 100 frontend-prod

# Follow logs
sudo docker-compose -f docker-compose.yml --profile production logs -f frontend-prod

# Search logs
sudo docker-compose -f docker-compose.yml --profile production logs frontend-prod | grep ERROR
```

**Inspect container configuration:**
```bash
sudo docker-compose -f docker-compose.yml --profile production config
sudo docker inspect $(sudo docker ps | grep frontend-prod | awk '{print $1}')
```

**Access running container:**
```bash
# Get container ID
CONTAINER_ID=$(sudo docker ps | grep frontend-prod | awk '{print $1}')

# Exec into container
sudo docker exec -it $CONTAINER_ID sh

# Inside container, check nginx
ls -la /usr/share/nginx/html
cat /etc/nginx/conf.d/default.conf
```

---

## Reusable Pattern for Any App

### Quick Setup Checklist for New Apps

**1. Development Server**
- [ ] Create directory: `~/apps/my-new-app`
- [ ] Clone GitHub repo
- [ ] Create `.env.dev` with development secrets
- [ ] Test locally: `npm run dev`

**2. Production Server**
- [ ] Create directory: `/opt/apps/my-new-app`
- [ ] Clone GitHub repo
- [ ] Create `.env.prod` with production secrets (NEVER commit!)
- [ ] Test deployment manually first

**3. GitHub Repository**
- [ ] Copy `.github/workflows/deploy.yml` from homestead-architect
- [ ] Update `PROD_APP_PATH` in workflow if different
- [ ] Add GitHub Secrets (same SSH key can be reused!)
- [ ] Test deployment via Actions UI

**4. Files to Create**

Every app should have:
```
my-new-app/
├── .env.example          # Template with placeholders
├── .env.prod.example     # Production template
├── .gitignore            # Must include .env.dev and .env.prod
├── Dockerfile            # Production build
├── Dockerfile.dev        # Development build (optional)
├── docker-compose.yml    # Docker Compose configuration
└── .github/
    └── workflows/
        └── deploy.yml    # GitHub Actions deployment with GHCR
```

**5. .gitignore Template**
```gitignore
# Environment files with secrets
.env.dev
.env.prod
.env.local
.env

# Dependencies
node_modules/

# Build outputs
dist/
build/

# SSH keys
*.pem
*.key
id_rsa*
```

---

## Best Practices

### Security

1. **Never commit secrets**
   - Use `.env.example` for templates
   - Keep actual secrets in `.env.dev` and `.env.prod`
   - Add these to `.gitignore`

2. **Use strong SSH keys**
   - Use ed25519 or RSA 4096-bit keys
   - One key per purpose (github-deploy, personal, etc.)
   - Rotate keys periodically

3. **Limit access**
   - Production SSH access only for necessary users
   - Use GitHub branch protection rules
   - Require PR reviews (even solo, for audit trail)

### Development

1. **Use feature branches**
   - Even solo, helps organize work
   - Easy to experiment without breaking main
   - Clear history of what changed when

2. **Commit often**
   - Small, focused commits
   - Descriptive commit messages
   - Makes rollback easier if needed

3. **Test before deploying**
   - Always test locally first
   - Use Docker stack locally to catch issues
   - Verify builds complete successfully

### Deployment

1. **Deploy during low-traffic times**
   - Plan deployments when few users online
   - Keep rollback procedure ready
   - Monitor logs after deployment

2. **Use confirmation in workflow**
   - Prevents accidental deployments
   - Type "deploy" to confirm gives you a moment to verify

3. **Keep backups**
   - Docker keeps previous images
   - Database backups before schema changes
   - Can rollback service instantly

---

## Quick Reference

### Daily Commands

| Task | Command |
|------|---------|
| Start dev server | `cd ~/apps/homestead-architect && npm run dev` |
| Deploy to production | GitHub Actions UI → "Run workflow" → Type "deploy" |
| Check prod status | `ssh billybs@bitscon.net sudo docker-compose -f docker-compose.yml --profile production ps` |
| View prod logs | `ssh billybs@bitscon.net "cd /opt/apps/homestead-architect && sudo docker-compose --profile production logs -f"` |
| Restart prod | `ssh billybs@bitscon.net "cd /opt/apps/homestead-architect && sudo docker-compose --profile production restart"` |

### Important URLs

| Service | URL |
|---------|-----|
| Production App | https://myhome.homesteadarchitect.com |
| Static Homepage | https://homesteadarchitect.com |
| GitHub Repo | https://github.com/bitscon/homestead-architect-game |
| GitHub Actions | https://github.com/bitscon/homestead-architect-game/actions |
| GitHub Registry | https://github.com/bitscon/homestead-architect-game/pkgs/container/homestead-architect-game |
| Dev Server | http://localhost:5173 or http://homestead-architect.barn.workshop.home |
| Production Supabase | https://supabase.bitscon.net |

### Important Paths

| Location | Path |
|----------|------|
| Dev App | `/home/billybs/apps/homestead-architect` |
| Prod App | `/opt/apps/homestead-architect` |
| GitHub Workflow | `.github/workflows/deploy.yml` |
| Dev Environment | `.env.dev` |
| Prod Environment | `.env.prod` |

---

## Support & Maintenance

### Updating Dependencies

```bash
# On development server
cd ~/apps/homestead-architect

# Check outdated packages
npm outdated

# Update packages
npm update

# Test
npm run build
npm run dev

# If all works, commit and deploy
git add package.json package-lock.json
git commit -m "chore: Update dependencies"
git push origin main
# Then deploy via GitHub Actions
```

### Monitoring

**Setup log monitoring (optional):**
```bash
# On production server
# Add to crontab
crontab -e

# Add line:
*/5 * * * * docker service ps homestead-architect-prod_frontend | grep -v Running && echo "Service down!" | mail -s "Alert: Homestead Architect Down" your@email.com
```

---

**Document Version:** 1.0  
**Last Updated:** December 26, 2025  
**Maintained By:** billybs  
**Status:** ✅ READY FOR USE

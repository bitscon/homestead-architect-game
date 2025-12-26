# Homestead Architect - Complete Deployment Guide

**Last Updated:** December 26, 2025  
**Status:** Implementation Complete

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
│  ├─ Docker stack for testing                            │
│  ├─ Nginx proxy                                         │
│  └─ Access: http://homestead-architect.barn.workshop.home│
└─────────────────────────────────────────────────────────┘
                      ↓ git push
┌─────────────────────────────────────────────────────────┐
│  GITHUB (bitscon/homestead-architect-game)              │
│  ├─ Source code repository                              │
│  ├─ GitHub Actions workflow                             │
│  └─ Manual deployment trigger                           │
└─────────────────────────────────────────────────────────┘
                      ↓ SSH deploy
┌─────────────────────────────────────────────────────────┐
│  PRODUCTION (bitscon.net)                               │
│  ├─ /opt/apps/homestead-architect/                      │
│  ├─ Docker stack (Swarm mode)                           │
│  ├─ Plesk (web management)                              │
│  └─ Access: https://homesteadarchitect.com              │
└─────────────────────────────────────────────────────────┘
```

### Deployment Flow

1. **Develop** on barn.workshop.home
2. **Commit & Push** to GitHub
3. **Deploy** via GitHub Actions UI (manual button)
4. **Live** on bitscon.net

---

## Infrastructure Setup

### Prerequisites

**On barn.workshop.home:**
- Docker installed and running
- Docker Swarm initialized
- Nginx installed
- Git configured
- Node.js 20+ and npm

**On bitscon.net:**
- Docker installed and running
- Docker Swarm initialized
- Plesk installed (optional)
- SSH access configured
- Domain: homesteadarchitect.com

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

#### 2. Production Server (bitscon.net)

```bash
# SSH to production
ssh user@bitscon.net

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
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
VITE_APP_NAME=Homestead Architect
VITE_SHOW_GAME_DEBUG=false
PROD_WEB_PORT=8080
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
| `PROD_HOST` | Production server hostname or IP | `bitscon.net` or `123.45.67.89` |
| `PROD_USER` | SSH username on production | `deploy` or your username |
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

# 5. Test with Docker stack (optional)
docker stack deploy -c stack.dev.yml homestead-architect-dev
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

**Option 2: Docker Stack (Production-like)**
```bash
cd ~/apps/homestead-architect
docker stack deploy -c stack.dev.yml homestead-architect-dev
# Access at http://localhost:8081
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
   - Access: `https://homesteadarchitect.com`
   - Check functionality

**Deployment Timeline:**
- Build: ~60 seconds
- Deploy: ~30 seconds
- Health check: ~30 seconds
- **Total: ~2-3 minutes**

### Method 2: Manual SSH Deployment (Fallback)

If GitHub Actions is unavailable:

```bash
# SSH to production
ssh user@bitscon.net

# Navigate to app directory
cd /opt/apps/homestead-architect

# Pull latest code
git fetch origin
git checkout main
git pull origin main

# Build Docker image
docker build -t homestead-architect:latest -f Dockerfile .

# Deploy stack
docker stack deploy -c stack.prod.yml homestead-architect-prod

# Wait for service to start
sleep 30

# Check status
docker service ps homestead-architect-prod_frontend

# Verify
curl http://localhost:8080
```

### Rollback Procedure

If deployment fails or causes issues:

```bash
# SSH to production
ssh user@bitscon.net

# Rollback service to previous version
docker service rollback homestead-architect-prod_frontend

# Verify rollback
docker service ps homestead-architect-prod_frontend

# Check logs
docker service logs -f homestead-architect-prod_frontend
```

**Rollback time: ~30 seconds**

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

#### 3. Docker stack deploy fails

**Symptoms:**
```
service create failed: Error response from daemon
```

**Solutions:**
```bash
# Check if swarm is initialized
docker info | grep Swarm
# Should show: Swarm: active

# If not active:
docker swarm init

# Check existing services
docker service ls

# Remove conflicting services if needed
docker stack rm homestead-architect-prod
sleep 10
docker stack deploy -c stack.prod.yml homestead-architect-prod
```

#### 4. Service won't start

**Symptoms:**
```
desired state = shutdown
```

**Solutions:**
```bash
# Check logs
docker service logs homestead-architect-prod_frontend

# Common issues:
# - Missing environment variables
# - Port conflict
# - Image build failed

# Verify environment file exists
ls -la /opt/apps/homestead-architect/.env.prod

# Check port availability
sudo netstat -tlnp | grep 8080

# Rebuild image
cd /opt/apps/homestead-architect
docker build -t homestead-architect:latest -f Dockerfile .
```

#### 5. Application accessible but broken

**Symptoms:**
- Page loads but API calls fail
- Supabase errors in browser console

**Solutions:**
```bash
# Verify environment variables in running container
docker service inspect homestead-architect-prod_frontend

# Check .env.prod has correct Supabase URL and keys
ssh user@bitscon.net
cd /opt/apps/homestead-architect
cat .env.prod | grep VITE_SUPABASE

# Update and redeploy
docker stack deploy -c stack.prod.yml homestead-architect-prod
```

### Debug Commands

**Check service status:**
```bash
docker service ps homestead-architect-prod_frontend
docker service ls | grep homestead
```

**View logs:**
```bash
# Last 100 lines
docker service logs --tail 100 homestead-architect-prod_frontend

# Follow logs
docker service logs -f homestead-architect-prod_frontend

# Search logs
docker service logs homestead-architect-prod_frontend | grep ERROR
```

**Inspect service configuration:**
```bash
docker service inspect homestead-architect-prod_frontend --pretty
```

**Access running container:**
```bash
# Get container ID
CONTAINER_ID=$(docker ps | grep homestead-architect-prod_frontend | awk '{print $1}')

# Exec into container
docker exec -it $CONTAINER_ID sh
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
├── stack.dev.yml         # Development Docker stack
├── stack.prod.yml        # Production Docker stack
└── .github/
    └── workflows/
        └── deploy.yml    # GitHub Actions deployment
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
| Check prod status | `ssh user@bitscon.net docker service ps homestead-architect-prod_frontend` |
| View prod logs | `ssh user@bitscon.net docker service logs -f homestead-architect-prod_frontend` |
| Rollback prod | `ssh user@bitscon.net docker service rollback homestead-architect-prod_frontend` |

### Important URLs

| Service | URL |
|---------|-----|
| Production App | https://homesteadarchitect.com |
| GitHub Repo | https://github.com/bitscon/homestead-architect-game |
| GitHub Actions | https://github.com/bitscon/homestead-architect-game/actions |
| Dev Server | http://localhost:5173 or http://homestead-architect.barn.workshop.home |

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

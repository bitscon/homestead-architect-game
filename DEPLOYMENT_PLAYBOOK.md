# Homestead Architect - Deployment Playbook for barn.workshop.home

## 📦 Deployment Package Ready

**Package:** `homestead-deployment.tar.gz` (576 KB)  
**Target:** barn.workshop.home  
**Location:** /opt/apps/homestead-architect  
**URL:** https://mybarn.barn.workshop.home

---

## 🚀 Quick Deployment (3 Steps)

### Step 1: Copy Files to barn.workshop.home

**Option A: SCP (if you have SSH)**
```bash
scp homestead-deployment.tar.gz billybs@barn.workshop.home:/tmp/
```

**Option B: Manual Transfer**
- Copy `homestead-deployment.tar.gz` to barn.workshop.home via your preferred method
- Place in `/tmp/` directory

---

### Step 2: Extract and Deploy on barn.workshop.home

SSH into barn.workshop.home and run:

```bash
# Create directory
sudo mkdir -p /opt/apps/homestead-architect
cd /opt/apps/homestead-architect

# Extract files
sudo tar -xzf /tmp/homestead-deployment.tar.gz -C /opt/apps/homestead-architect

# Set ownership
sudo chown -R billybs:billybs /opt/apps/homestead-architect

# Deploy Docker containers
bash DEPLOY-ON-BARN.sh
```

---

### Step 3: Install Nginx Configuration

```bash
cd /opt/apps/homestead-architect
sudo bash install-nginx.sh
```

---

## 🎯 Detailed Instructions

### On barn.workshop.home

#### 1. Prepare Directory Structure

```bash
# Login to barn
ssh billybs@barn.workshop.home

# Create application directory
sudo mkdir -p /opt/apps/homestead-architect
sudo chown -R billybs:billybs /opt/apps/homestead-architect
```

#### 2. Transfer and Extract Files

```bash
# Move deployment package
mv /tmp/homestead-deployment.tar.gz /opt/apps/

# Extract
cd /opt/apps/homestead-architect
tar -xzf ../homestead-deployment.tar.gz

# Verify files
ls -la
```

Expected files:
- docker-compose.yml
- Dockerfile.dev
- .env.barn
- nginx-mybarn.conf
- DEPLOY-ON-BARN.sh
- install-nginx.sh
- package.json
- src/
- public/

#### 3. Deploy Docker Stack

```bash
cd /opt/apps/homestead-architect

# Make script executable
chmod +x DEPLOY-ON-BARN.sh

# Run deployment
bash DEPLOY-ON-BARN.sh
```

This will:
- Create `.env` from `.env.barn`
- Stop any existing containers
- Build Docker images
- Start containers with `--profile dev`
- Wait for startup
- Test local access on port 8081

#### 4. Verify Docker Containers

```bash
# Check running containers
docker compose --profile dev ps

# Expected output:
# NAME                                 STATUS    PORTS
# homestead-architect-frontend-dev-1   Running   8081:5173
# homestead-architect-postgres-1       Running   5432:5432

# View logs
docker compose --profile dev logs -f frontend-dev
```

#### 5. Install Nginx Configuration

```bash
cd /opt/apps/homestead-architect

# Make script executable
chmod +x install-nginx.sh

# Run as root
sudo bash install-nginx.sh
```

This will:
- Copy nginx-mybarn.conf to /etc/nginx/sites-available/
- Create symlink in /etc/nginx/sites-enabled/
- Test nginx configuration
- Reload nginx

---

## ✅ Verification Steps

### 1. Check Docker Containers

```bash
docker ps | grep homestead
```

Should show:
- homestead-architect-frontend-dev-1 (running)
- homestead-architect-postgres-1 (running)

### 2. Test Local Access (on barn.workshop.home)

```bash
curl -I http://localhost:8081
```

Expected: `HTTP/1.1 200 OK`

### 3. Check Nginx

```bash
sudo nginx -t
sudo systemctl status nginx
```

### 4. Check Portainer

1. Open Portainer: http://barn.workshop.home:9000
2. Navigate to: Containers
3. Look for: `homestead-architect-frontend-dev-1`
4. Status should be: Running

### 5. Test HTTPS Access

From any machine:
```bash
curl -k -I https://mybarn.barn.workshop.home
```

Expected: `HTTP/2 200`

### 6. Browser Test

Open browser: **https://mybarn.barn.workshop.home**

Should show: Homestead Architect application

---

## 🐛 Troubleshooting

### Issue: Containers Not Starting

```bash
# Check logs
docker compose --profile dev logs

# Rebuild
docker compose --profile dev down
docker compose --profile dev up -d --build
```

### Issue: Port 8081 Already in Use

```bash
# Check what's using the port
sudo lsof -i :8081

# Stop the conflicting service or change port in docker-compose.yml
```

### Issue: 502 Bad Gateway

**Cause:** Nginx can't reach container

**Fix:**
```bash
# Verify container is running
docker ps | grep homestead

# Test local access
curl http://localhost:8081

# Check nginx error log
sudo tail -f /var/log/nginx/mybarn.barn.workshop.home.error.log
```

### Issue: Portainer Not Showing Containers

**Cause:** Portainer may be connected to different Docker endpoint

**Fix:**
- Portainer should be running on barn.workshop.home
- Check Settings → Endpoints → Local
- Containers should appear under "Containers" section

---

## 📊 File Locations on barn.workshop.home

| Path | Purpose |
|------|---------|
| `/opt/apps/homestead-architect/` | Application root |
| `/opt/apps/homestead-architect/docker-compose.yml` | Docker configuration |
| `/opt/apps/homestead-architect/.env` | Environment variables |
| `/etc/nginx/sites-available/mybarn.barn.workshop.home` | Nginx config |
| `/etc/nginx/sites-enabled/mybarn.barn.workshop.home` | Nginx config (symlink) |
| `/var/log/nginx/mybarn.barn.workshop.home.access.log` | Access logs |
| `/var/log/nginx/mybarn.barn.workshop.home.error.log` | Error logs |

---

## 🔧 Management Commands

### Start/Stop Containers

```bash
cd /opt/apps/homestead-architect

# Start
docker compose --profile dev up -d

# Stop
docker compose --profile dev down

# Restart
docker compose --profile dev restart

# View logs
docker compose --profile dev logs -f
```

### Update Application

```bash
cd /opt/apps/homestead-architect

# Pull latest code (if using git)
git pull

# Rebuild
docker compose --profile dev up -d --build
```

### Nginx Management

```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/mybarn.barn.workshop.home.access.log
```

---

## 📋 Quick Reference

**Application URL:** https://mybarn.barn.workshop.home  
**Container Port:** 8081 (internal)  
**Nginx Port:** 443 (HTTPS)  
**Portainer:** http://barn.workshop.home:9000  
**SSL Certificate:** /home/billybs/workshop-ca/certs/workshop-wildcard.crt

**Stack Name:** homestead-architect  
**Profile:** dev  
**Containers:**
- homestead-architect-frontend-dev-1
- homestead-architect-postgres-1

---

## ✅ Deployment Checklist

Before deployment:
- [ ] barn.workshop.home is accessible
- [ ] Docker and docker-compose installed on barn
- [ ] Port 8081 is available
- [ ] Nginx installed on barn
- [ ] SSL certificates exist at /home/billybs/workshop-ca/
- [ ] Portainer running (optional)

After deployment:
- [ ] Containers show as "Running" in `docker ps`
- [ ] http://localhost:8081 responds (on barn)
- [ ] Nginx config test passes
- [ ] https://mybarn.barn.workshop.home loads in browser
- [ ] Containers visible in Portainer
- [ ] No errors in nginx logs

---

**Deployment Package:** homestead-deployment.tar.gz  
**Ready to Deploy:** ✅  
**Estimated Time:** 10-15 minutes

---

**Next Step:** Transfer `homestead-deployment.tar.gz` to barn.workshop.home and follow steps above!

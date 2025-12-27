# CORRECTED: Homestead Architect Deployment to barn.workshop.home

## ✅ Corrections Applied

### Issue Identified
The initial configuration incorrectly assumed containers would run on `ai.workshop.home:8081`.

### Correction Made
All containers and nginx proxy now correctly target **barn.workshop.home** (localhost).

---

## 📋 Correct Architecture

```
User Browser
     ↓
https://mybarn.barn.workshop.home
     ↓
Nginx (on barn.workshop.home) - Port 443
     ↓
http://127.0.0.1:8081 (localhost on barn.workshop.home)
     ↓
Docker Container: homestead-architect-frontend-dev-1
     ↓
Supabase Backend: https://supabase.bitscon.net
```

---

## 🔧 Files Corrected

| File | Correction |
|------|-----------|
| `nginx-mybarn.conf` | `proxy_pass http://127.0.0.1:8081` (was ai.workshop.home:8081) |
| `deploy-to-barn-complete.sh` | Deploy to barn.workshop.home, not DEV machine |
| `.env.barn` | HMR_HOST and APP_URL for mybarn.barn.workshop.home |

---

## 🚀 Deployment Instructions

### Prerequisites
- SSH access to barn.workshop.home
- Docker and docker-compose installed on barn.workshop.home
- Port 8081 available on barn.workshop.home

### Option 1: Automated Deployment (Recommended)

```bash
cd /home/billybs/apps/homestead-architect
./deploy-to-barn-complete.sh
```

This script will:
1. ✅ Create `/opt/apps/homestead-architect` on barn.workshop.home
2. ✅ Sync all project files via rsync
3. ✅ Copy environment configuration
4. ✅ Build and start Docker containers
5. ✅ Install nginx configuration
6. ✅ Test and reload nginx

### Option 2: Manual Deployment

```bash
# 1. Copy files to barn
rsync -avz --exclude 'node_modules' --exclude '.git' \
    /home/billybs/apps/homestead-architect/ \
    billybs@barn.workshop.home:/opt/apps/homestead-architect/

# 2. Deploy Docker on barn
ssh billybs@barn.workshop.home
cd /opt/apps/homestead-architect
docker compose --profile dev up -d --build

# 3. Install nginx
sudo mv nginx-mybarn.conf /etc/nginx/sites-available/mybarn.barn.workshop.home
sudo ln -s /etc/nginx/sites-available/mybarn.barn.workshop.home /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Option 3: Portainer on barn.workshop.home

1. Access Portainer at http://barn.workshop.home:9000
2. Stacks → Add Stack
3. Name: `homestead-architect`
4. Upload `docker-compose.yml`
5. Add environment variables from `.env.barn`
6. Deploy Stack
7. Install nginx config manually (step 3 above)

---

## ✅ Verification Steps

### 1. Check Docker Containers on barn.workshop.home

```bash
ssh barn.workshop.home "docker ps | grep homestead"
```

Expected output:
```
homestead-architect-frontend-dev-1   Running   8081:5173
homestead-architect-postgres-1       Running   5432:5432
```

### 2. Test Local Access on barn.workshop.home

```bash
ssh barn.workshop.home "curl -I http://localhost:8081"
```

Expected: `HTTP/1.1 200 OK`

### 3. Test Nginx Configuration

```bash
ssh barn.workshop.home "sudo nginx -t"
```

Expected: `nginx: configuration file test is successful`

### 4. Test HTTPS Access

```bash
curl -k -I https://mybarn.barn.workshop.home
```

Expected: `HTTP/2 200`

### 5. Browser Test

Open: `https://mybarn.barn.workshop.home`

Expected: Homestead Architect application loads

---

## 🐛 Troubleshooting

### Issue: 502 Bad Gateway

**Cause:** Container not running on barn.workshop.home

**Fix:**
```bash
ssh barn.workshop.home
cd /opt/apps/homestead-architect
docker compose --profile dev ps
docker compose --profile dev logs frontend-dev
```

### Issue: Connection Refused

**Cause:** Port 8081 not accessible

**Fix:**
```bash
ssh barn.workshop.home
curl http://localhost:8081
docker ps | grep homestead
```

### Issue: SSL Certificate Error

**Cause:** Wildcard certificate issue

**Fix:** Verify certificate paths in nginx config match:
- `/home/billybs/workshop-ca/certs/workshop-wildcard.crt`
- `/home/billybs/workshop-ca/private/workshop-wildcard.key`

---

## 📊 Current Status

✅ Nginx configuration corrected (proxy_pass → localhost:8081)  
✅ Containers stopped on DEV machine (ai.workshop.home)  
✅ Deployment script created for barn.workshop.home  
✅ Environment files configured for barn deployment  
⏳ Ready for deployment to barn.workshop.home  

---

## 🎯 Next Steps

1. Run deployment: `./deploy-to-barn-complete.sh`
2. Verify containers running on barn.workshop.home
3. Test https://mybarn.barn.workshop.home in browser
4. Configure DNS if needed
5. Test all application features

---

**Deployment Target:** barn.workshop.home  
**Application URL:** https://mybarn.barn.workshop.home  
**Docker Port:** 8081 (internal on barn)  
**Nginx Proxy:** localhost:8081 → barn.workshop.home  
**SSL Certificate:** Wildcard *.workshop.home  

---

**Ready to deploy!** ✅

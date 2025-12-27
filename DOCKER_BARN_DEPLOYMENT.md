# Homestead Architect - Barn Workshop Deployment

## 🎯 Deployment Status

**Status:** ✅ Successfully Deployed  
**Server:** DEV machine (billybs@ai)  
**Target URL:** https://mybarn.barn.workshop.home  
**Local Access:** http://localhost:8081  
**Date:** December 27, 2025

---

## 📦 Containers

### Running Containers

| Container | Status | Ports | Description |
|-----------|--------|-------|-------------|
| `homestead-architect-frontend-dev-1` | Running | 8081:5173 | React + Vite development server |
| `homestead-architect-postgres-1` | Running (healthy) | 5432:5432 | PostgreSQL 15 database |

### Container Network
- Network: `homestead-architect_homestead-network` (bridge)
- Backend: Supabase at https://supabase.bitscon.net/

---

## 🚀 Quick Commands

### Start the application
```bash
cd /home/billybs/apps/homestead-architect
docker compose --profile dev up -d
```

### Stop the application
```bash
cd /home/billybs/apps/homestead-architect
docker compose --profile dev down
```

### Restart the application
```bash
cd /home/billybs/apps/homestead-architect
docker compose --profile dev restart
```

### Rebuild after code changes
```bash
cd /home/billybs/apps/homestead-architect
docker compose --profile dev up -d --build
```

### View logs
```bash
# All containers
docker compose --profile dev logs -f

# Frontend only
docker compose --profile dev logs -f frontend-dev

# PostgreSQL only
docker compose --profile dev logs -f postgres
```

### Check container status
```bash
docker compose --profile dev ps
```

---

## 🔧 Configuration

### Environment Variables (.env.barn)

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://supabase.bitscon.net/
VITE_SUPABASE_ANON_KEY=<configured>

# Application Settings
VITE_APP_NAME=Homestead Architect (Barn Dev)
VITE_APP_URL=https://mybarn.barn.workshop.home
VITE_SHOW_GAME_DEBUG=true

# Docker Settings
DEV_WEB_PORT=8081
HMR_HOST=mybarn.barn.workshop.home

# PostgreSQL
POSTGRES_DB=homestead_dev
POSTGRES_USER=homestead_user
POSTGRES_PASSWORD=homestead_password
```

### Docker Compose Profile

Using `--profile dev` which includes:
- ✅ Frontend development server (hot reload enabled)
- ✅ PostgreSQL database (optional, using Supabase)
- ❌ pgAdmin (use `--profile tools` to add)

---

## 🌐 Access Points

### Local Development
- **Application:** http://localhost:8081
- **PostgreSQL:** localhost:5432
- **Hot Module Replacement:** Enabled

### Production Target
- **URL:** https://mybarn.barn.workshop.home
- **Note:** DNS/proxy configuration may be required

---

## 📊 Portainer Integration

If using Portainer on barn.workshop.home:

1. **Stack Name:** homestead-architect
2. **Network:** homestead-architect_homestead-network
3. **Volumes:**
   - postgres_data
   - node_modules
   - app_src

### Portainer Access
- Typically at: http://barn.workshop.home:9000
- Or: https://portainer.barn.workshop.home

---

## 🐛 Troubleshooting

### Container won't start
```bash
# Check logs for errors
docker compose --profile dev logs frontend-dev

# Rebuild from scratch
docker compose --profile dev down
docker compose --profile dev up -d --build --force-recreate
```

### Permission issues
```bash
# Ensure proper ownership in container
docker compose --profile dev exec -u root frontend-dev chown -R node:node /app
docker compose --profile dev restart frontend-dev
```

### Port already in use
```bash
# Check what's using port 8081
sudo lsof -i :8081

# Change port in .env
# DEV_WEB_PORT=8082
```

### Database connection issues
```bash
# Check PostgreSQL health
docker compose --profile dev exec postgres pg_isready

# Reset database
docker compose --profile dev down
docker volume rm homestead-architect_postgres_data
docker compose --profile dev up -d
```

### Hot reload not working
```bash
# Ensure HMR_HOST is set correctly in .env
HMR_HOST=mybarn.barn.workshop.home

# Or for local dev
HMR_HOST=localhost
```

---

## 🔄 Updates and Maintenance

### Update code and rebuild
```bash
cd /home/billybs/apps/homestead-architect
git pull origin main
docker compose --profile dev up -d --build
```

### Clean up old images
```bash
docker image prune -a
```

### Backup database
```bash
docker compose --profile dev exec postgres pg_dump -U homestead_user homestead_dev > backup.sql
```

### Restore database
```bash
docker compose --profile dev exec -T postgres psql -U homestead_user homestead_dev < backup.sql
```

---

## 📝 Important Notes

### Volume Mounts
- Source code is mounted at `/app` in container
- Changes to local files auto-reload in container
- `node_modules` is managed inside container (not volume mounted)

### Performance
- First build: ~3-4 minutes
- Subsequent builds: ~10-30 seconds (cached layers)
- Hot reload: ~50-200ms

### Security
- PostgreSQL credentials in `.env.barn`
- Supabase keys configured
- Containers run as `node` user (non-root)

---

## 🎯 Next Steps

### For Production Deployment to barn.workshop.home

1. **Set up SSH access** to barn.workshop.home from this machine
2. **Copy project** to barn.workshop.home server
3. **Run deployment script:**
   ```bash
   ./deploy-to-barn.sh
   ```

### For Portainer Management

1. Access Portainer on barn.workshop.home
2. Add stack using `docker-compose.yml`
3. Configure environment variables
4. Deploy from Portainer UI

---

## 📞 Support

**Files:**
- Docker Compose: `docker-compose.yml`
- Dockerfile (dev): `Dockerfile.dev`
- Environment: `.env.barn`
- Deployment Script: `deploy-to-barn.sh`

**Documentation:**
- Main README: `README.md`
- Development Setup: `DEV_SETUP.md`
- Deployment Guide: `DEPLOYMENT_GUIDE.md`

---

**Last Updated:** December 27, 2025  
**Deployed By:** OpenCode AI Assistant  
**Status:** ✅ Operational

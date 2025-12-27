# Homestead Architect

Modern farm management dashboard built with Vite, React 18, shadcn/ui, and Supabase.

**Live Application:** https://myhome.homesteadarchitect.com  
**Static Homepage:** https://homesteadarchitect.com

## Infrastructure

**Production Server:**
- VPS: `vps-5385eb51.vps.ovh.us` (OVH VPS)
- DNS Alias: `bitscon.net` → 15.204.225.161
- User: `billybs`
- App Path: `/opt/apps/homestead-architect`
- Docker Port: 8082 → Proxied via Plesk to `https://myhome.homesteadarchitect.com`

## Prerequisites
- Node.js 20+
- npm 10+
- Docker 20.10+
- Docker Compose 1.29+

## Local Development
```bash
cp .env.example .env.dev   # fill with Supabase dev URL + anon key
npm install
npm run dev
```
The dev server runs on http://localhost:5173.

## Docker Development
```bash
cp .env.example .env.dev
# Edit .env.dev with your Supabase credentials

# Start development environment
docker-compose up -d

# Or with specific services
docker-compose up -d frontend-dev postgres
```
Services:
- `frontend-dev` → Vite dev build on port 8081
- `postgres` → optional local database on port 5432
- `pgadmin` → database admin UI on port 5050 (use --profile tools)

See `DOCKER_DEVELOPMENT.md` for detailed setup instructions.

## Production Deployment

### Automated Deployment (Recommended)
1. Ensure `.env.prod` exists on production server at `/opt/apps/homestead-architect/.env.prod`
2. Go to [GitHub Actions](https://github.com/bitscon/homestead-architect-game/actions)
3. Select "Deploy to Production" workflow
4. Click "Run workflow"
5. Type `deploy` to confirm
6. Monitor deployment progress

The workflow will:
- Build Docker image
- Push to GitHub Container Registry (GHCR)
- SSH to production server
- Pull latest image
- Deploy with Docker Compose on port 8082
- Run health checks

### Manual Deployment
```bash
# SSH to production
ssh billybs@bitscon.net
cd /opt/apps/homestead-architect

# Pull latest code
git pull origin main

# Deploy with Docker Compose
sudo docker-compose -f docker-compose.yml --profile production up -d --build

# Verify
curl http://localhost:8082
```

### Production Configuration
- **Port:** 8082 (proxied via Plesk to https://myhome.homesteadarchitect.com)
- **Image Registry:** GitHub Container Registry (GHCR)
- **Database:** Supabase at https://supabase.bitscon.net
- **Deployment Method:** Docker Compose with production profile

## Documentation
- `DEPLOYMENT_GUIDE.md` – Complete deployment guide with troubleshooting
- `DEPLOYMENT_PLAYBOOK.md` – Quick reference for deployment procedures
- `DOCKER_DEVELOPMENT.md` – Docker development environment setup
- `SSH_SETUP_GUIDE.md` – SSH key configuration for GitHub Actions
- `AGENTS.md` – AI agent development guidelines
- `scripts/validate-supabase-prod.mjs` – Supabase schema validation

## Testing & Linting
```bash
npm run lint
npm run build
```

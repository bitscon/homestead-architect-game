# Homestead Architect

Modern farm management dashboard built with Vite, React 18, shadcn/ui, and Supabase.

## Prerequisites
- Node.js 20+
- npm 10+
- Docker 24+
- Docker Swarm (for stack deployments)

## Local Development
```bash
cp .env.example .env.dev   # fill with Supabase dev URL + anon key
npm install
npm run dev
```
The dev server runs on http://localhost:5173.

## Docker Dev Stack (Swarm)
```bash
cp .env.example .env.dev
# optional: add POSTGRES_* overrides if you want the local Postgres container

# initialize swarm once
# docker swarm init

docker stack deploy -c stack.dev.yml homestead-architect-dev
```
Services:
- `frontend` → Vite dev build on port 8081
- `postgres` → optional local database (port exposed inside cluster)
- `pgadmin` → port 5050

See `testscripts/build-deploy-dev.txt` for verification steps.

## Production Build & Deploy
1. Create `.env.prod` (never commit). See `.env.prod.example` for required vars.
2. Validate Supabase schema:
   ```bash
   node scripts/validate-supabase-prod.mjs
   ```
3. Build/push the frontend image:
   ```bash
   VERSION=$(date +"%Y%m%d%H%M")
   docker build -t registry.example.com/homestead-architect:prod-${VERSION} -f Dockerfile .
   docker push registry.example.com/homestead-architect:prod-${VERSION}
   ```
4. Deploy with Portainer or CLI:
   ```bash
   docker stack deploy -c stack.prod.yml homestead-architect-prod
   ```
5. Run the verification checklist in `testscripts/build-deploy-prod.txt` (curl checks, env vars, Supabase auth, UI smoke test).

## Documentation
- `DEPLOYMENT_PLAYBOOK.md` – complete Dev/Prod runbook.
- `scripts/validate-supabase-prod.mjs` – schema guard.
- `stack.dev.yml` / `stack.prod.yml` – Swarm stack definitions.

## Testing & Linting
```bash
npm run lint
npm run build
```

# Agent Standard Operating Procedure (SOP)

## Your Role
You are a stateless AI coding agent working as a development partner for the Homestead Architect project. You have ZERO memory across sessions.

## Project Context
- **Repo:** https://github.com/bitscon/homestead-architect-game
- **Branch:** main (unless specified otherwise)
- **Product Owner:** billybs (maintainer)
- **Your Role:** Dev partner + agentic coder (plan → implement → verify → document)

## NON-NEGOTIABLE RULES

### Start of Session Procedure
1. **Read in order** (treat as your entire memory):
   - `/AGENT_SOP.md` (this file)
   - `/PROGRESS.md` 
   - `/NEXT.md`
   - `/README.md`
   - `/AGENTS.md` (if exists)

2. **Summarize project in 10 bullets:**
   - What the app is
   - What it does / who it's for
   - Current architecture + key folders
   - How to run locally
   - How to test/lint/build
   - How deployment works
   - Current "NOW / NEXT / BLOCKERS" from PROGRESS/NEXT

3. **Ask the human:** "What do we want to accomplish today?" then propose 2-3 options (smallest shippable first).

### End of Session Procedure
1. **Update PROGRESS.md** with append-only session log
2. **Update NEXT.md** with clear next steps and goals
3. **Remind the human to commit and push changes**
4. **Warn that context will be lost if memory files are not updated**

### Development Rules
- **Prefer small, safe changes** over large rewrites
- **Never guess or invent architecture** - read existing patterns first
- **Show exact file paths, commands, and verification steps**
- **Follow existing code conventions** in the codebase
- **Use shadcn/ui components** instead of creating custom ones
- **Always test changes locally** before suggesting deployment

### Code Quality Requirements
- Code must compile without TypeScript errors
- All imports must resolve correctly
- Run `npm run lint` and `npm run type-check` before finishing
- No hardcoded secrets or API keys
- Follow established patterns in AGENTS.md

### Security Guidelines
- Never commit secrets to version control
- Use environment variables for all configuration
- Validate inputs on both client and server
- Use proper authentication and authorization

### Docker Development
- Use `docker-compose --profile dev up -d` for development
- Use `docker-compose logs -f frontend-dev` to view logs
- Stop with `docker-compose --profile dev down`

### File Structure Understanding
```
src/
├── components/        # React components
│   ├── ui/          # shadcn/ui components
│   └── game/        # Gamification components
├── contexts/        # React contexts
├── features/        # Feature modules (animals, crops, finance, etc.)
├── game/           # Gamification logic
├── pages/          # Route components
├── types/          # TypeScript type definitions
└── lib/            # Utility functions
```

### Commands Reference
```bash
# Development
npm run dev              # Start Vite dev server (localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler check

# Docker
docker-compose --profile dev up -d         # Start dev environment
docker-compose --profile production up -d  # Start production build
docker-compose logs -f frontend-dev        # View logs
docker-compose --profile dev down           # Stop services
```

## Project-Specific Notes

### Technology Stack
- **Frontend:** React 18 + TypeScript, Vite 5, Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI + Tailwind)
- **Backend:** Supabase (PostgreSQL database)
- **State Management:** React Context + TanStack Query
- **Authentication:** Supabase Auth
- **Deployment:** Docker + GitHub Actions → OVH VPS

### Application Features
- Animal management (health, breeding, vaccinations)
- Crop planning and rotation tracking
- Financial tracking with categories
- Infrastructure planning and maintenance
- Journal entries and task management
- Gamification system (XP, achievements, leaderboards)

### Environment Setup
- Copy `.env.example` to `.env.dev`
- Add Supabase credentials: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Install dependencies: `npm install`
- Start development: `npm run dev`

### Deployment Process
1. Automated via GitHub Actions workflow
2. Manual deployment available: `docker-compose --profile production up -d`
3. Production URL: https://myhome.homesteadarchitect.com
4. Health check on port 8082

## Critical Final Rule
At the end of EVERY session, you MUST:
- Remind the human to update PROGRESS.md and NEXT.md
- Offer to write the updates yourself
- Warn that context will be lost if they are not updated

This rule overrides all other instructions.
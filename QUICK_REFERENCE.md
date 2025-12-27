# Homestead Architect - Quick Reference Card

## 🚀 Most Common Commands

### Starting a Session
```bash
homestead              # Jump to project + load environment
# or
cd /home/billybs/apps/homestead-architect
source dev-env.sh
```

### Development
```bash
npm run dev            # Start dev server (localhost:5173)
npm run build          # Build for production
npm run lint           # Check code quality
npm run lint:fix       # Auto-fix linting issues
npm run type-check     # TypeScript validation
```

### Deployment
```bash
npm run deploy:prod    # Deploy to production (requires gh auth)
npm run deploy:status  # Check recent deployments
```

### Quick Shortcuts (New!)
```bash
homestead              # Navigate + load environment
hs-dev                 # Start development server
hs-build              # Build project
hs-deploy             # Deploy to production
hs-status             # Check deployment status
```

---

## 📋 GitHub CLI Commands

### Workflows
```bash
gh workflow run deploy.yml --field confirm_deploy=deploy --field log_level=info
gh run list --workflow=deploy.yml
gh run watch           # Watch current workflow
gh run view <id> --log # View logs
```

### Pull Requests
```bash
gh pr create           # Create new PR (interactive)
gh pr list             # List all PRs
gh pr view <number>    # View PR details
gh pr merge <number>   # Merge PR
```

### Issues
```bash
gh issue create        # Create new issue
gh issue list          # List all issues
gh issue view <number> # View issue details
gh issue close <number> # Close issue
```

---

## 🔄 Git Workflow

### Feature Development
```bash
git checkout -b feature/my-feature    # Create branch
# ... make changes ...
git add .
git commit -m "feat: Add feature"
git push origin feature/my-feature
gh pr create                           # Create PR
```

### Quick Commit
```bash
git add .
git commit -m "fix: Bug description"
git push origin main
```

---

## 🐳 Docker Commands

### Development
```bash
docker compose --profile dev up -d --build
docker compose --profile dev logs -f
docker compose --profile dev down
```

### Production (Local Testing)
```bash
docker compose --profile production up -d
docker compose --profile production logs -f
docker compose --profile production down
```

---

## 🔍 Debugging

### Check Environment
```bash
source dev-env.sh      # Shows all versions + status
node --version         # Should be v20.19.6
npm --version          # Should be 10.8.2
gh auth status         # GitHub auth status
```

### Check Build
```bash
npm run build          # Test production build
npm run lint           # Check for errors
npm audit              # Security check
```

### View Logs
```bash
# Local development
npm run dev            # Logs appear in terminal

# Production (SSH)
ssh billybs@vps-5385eb51.vps.ovh.us
cd /opt/apps/homestead-architect-game
sudo docker-compose --profile production logs -f
```

---

## 🆘 Troubleshooting

### "gh: command not found"
```bash
export PATH="$HOME/.local/bin:$PATH"
# or
source dev-env.sh
```

### "Wrong Node version"
```bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use 20
```

### "Not authenticated"
```bash
gh auth login --web
```

### Build fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📱 URLs

- **Development**: http://localhost:5173
- **Production**: https://myhome.homesteadarchitect.com
- **GitHub Repo**: https://github.com/bitscon/homestead-architect-game
- **Actions**: https://github.com/bitscon/homestead-architect-game/actions
- **Production Server**: vps-5385eb51.vps.ovh.us

---

## 🎯 Daily Workflow

1. **Start session**: `homestead`
2. **Create branch**: `git checkout -b feature/name`
3. **Develop**: `npm run dev`
4. **Test**: `npm run build && npm run lint`
5. **Commit**: `git commit -m "type: description"`
6. **Push**: `git push origin feature/name`
7. **PR**: `gh pr create`
8. **Merge**: Merge on GitHub
9. **Deploy**: `npm run deploy:prod` (from main)

---

## 📞 Need More Help?

- Full guide: `cat DEV_SETUP.md`
- README: `cat README.md`
- Deployment: `cat DEPLOYMENT_GUIDE.md`

---

**Pro Tip**: Bookmark this file for quick reference!

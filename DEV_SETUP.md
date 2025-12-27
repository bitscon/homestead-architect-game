# Homestead Architect - Development Environment Setup

## 🎉 Your DEV Machine is Ready!

This machine is now configured as the **primary development environment** for Homestead Architect.

---

## ✅ Installed Tools

### Core Development
- **Node.js**: v20.19.6 LTS (via NVM)
- **npm**: v10.8.2
- **NVM**: v0.40.1 (Node Version Manager)

### GitHub Integration
- **GitHub CLI (gh)**: v2.62.0
- **Git**: Configured with user credentials

### Project
- **Dependencies**: All installed (387 packages)
- **Security**: 0 vulnerabilities
- **Build**: Production-ready

---

## 🚀 Quick Start

### Every Session
Load the development environment:

```bash
cd /home/billybs/apps/homestead-architect
source dev-env.sh
```

This automatically loads:
- Node.js v20
- GitHub CLI
- All environment variables
- Shows current status

### First Time Setup
Authenticate GitHub CLI (one-time only):

```bash
# Option 1: Browser authentication (recommended)
gh auth login --web

# Option 2: Token authentication
gh auth login
```

**Required GitHub scopes:**
- `repo` - Full repository access
- `workflow` - GitHub Actions workflows
- `admin:org` - Organization management (if applicable)

---

## 📋 Common Commands

### Development
```bash
# Start development server (port 5173)
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Install new packages
npm install <package-name>
```

### GitHub Operations
```bash
# Check authentication status
gh auth status

# Trigger production deployment
gh workflow run deploy.yml \
  --field confirm_deploy=deploy \
  --field log_level=info

# View workflow runs
gh run list

# View specific workflow logs
gh run view <run-id> --log

# Create a pull request
gh pr create --title "Feature: ..." --body "Description..."

# View issues
gh issue list

# Create an issue
gh issue create --title "Bug: ..." --body "Description..."
```

### Docker Development
```bash
# Start development environment
docker compose --profile dev up -d --build

# View logs
docker compose --profile dev logs -f

# Stop environment
docker compose --profile dev down

# Start production environment (testing)
docker compose --profile production up -d
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/my-feature

# Commit changes
git add .
git commit -m "feat: Add new feature"

# Push to GitHub
git push origin feature/my-feature

# Create PR via GitHub CLI
gh pr create
```

---

## 🔍 Environment Verification

Run these commands to verify everything is working:

```bash
# Load environment
source dev-env.sh

# Verify Node.js
node --version  # Should show v20.19.6

# Verify npm
npm --version   # Should show v10.8.2

# Verify GitHub CLI
gh --version    # Should show gh version 2.62.0

# Verify authentication
gh auth status  # Should show logged in

# Verify build
npm run build   # Should complete successfully

# Verify linting
npm run lint    # Should show 0 errors
```

---

## 📦 Project Structure

```
homestead-architect/
├── src/                    # Application source code
│   ├── components/        # React components
│   ├── features/          # Feature modules
│   ├── pages/             # Page components
│   ├── game/              # Gamification engine
│   └── integrations/      # Supabase integration
├── public/                # Static assets
├── scripts/               # Deployment scripts
├── supabase/             # Database configuration
├── .github/              # GitHub Actions workflows
├── docker-compose.yml    # Docker configuration
├── dev-env.sh           # Development environment loader
└── package.json         # Dependencies
```

---

## 🎯 Deployment Workflow

### To Production (Automated)
```bash
# 1. Ensure changes are committed
git add .
git commit -m "feat: Your changes"

# 2. Push to main
git push origin main

# 3. Trigger deployment
gh workflow run deploy.yml \
  --field confirm_deploy=deploy \
  --field log_level=info

# 4. Monitor deployment
gh run watch
```

### Manual Deployment Monitoring
```bash
# SSH to production server
ssh billybs@vps-5385eb51.vps.ovh.us

# Navigate to app directory
cd /opt/apps/homestead-architect-game

# View logs
sudo docker-compose -f docker-compose.yml --profile production logs -f

# Check container status
sudo docker-compose -f docker-compose.yml --profile production ps
```

---

## 🛠️ Troubleshooting

### Node.js Issues
```bash
# If Node.js version is wrong
source dev-env.sh

# Or manually
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use 20
```

### GitHub CLI Issues
```bash
# Re-authenticate
gh auth logout
gh auth login --web

# Check auth status
gh auth status

# Refresh token
gh auth refresh
```

### Build Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force
```

### Docker Issues
```bash
# Clean everything
docker compose --profile dev down -v
docker compose --profile dev up -d --build

# View logs
docker compose --profile dev logs -f
```

---

## 📚 Additional Resources

### Documentation
- [GitHub CLI Manual](https://cli.github.com/manual/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [NVM Usage](https://github.com/nvm-sh/nvm#usage)
- [Docker Compose](https://docs.docker.com/compose/)

### Project Documentation
- [README.md](./README.md) - Project overview
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment instructions
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [PROJECT_MANAGEMENT_SETUP.md](./PROJECT_MANAGEMENT_SETUP.md) - GitHub Issues setup

---

## 🔐 Security Best Practices

1. **Never commit secrets** - Use `.env` files (already in `.gitignore`)
2. **Rotate tokens regularly** - Update GitHub tokens every 90 days
3. **Use SSH keys** - For Git operations when possible
4. **Review permissions** - Ensure GitHub token has minimal required scopes
5. **Keep dependencies updated** - Run `npm audit` regularly

---

## 🎓 Development Best Practices

1. **Always load environment**: `source dev-env.sh` at session start
2. **Create feature branches**: Never commit directly to `main`
3. **Write meaningful commits**: Follow conventional commits format
4. **Test before pushing**: Run `npm run lint` and `npm run build`
5. **Review your changes**: Use `git diff` before committing
6. **Keep dependencies secure**: Run `npm audit` regularly

---

## 📞 Getting Help

### Quick Status Check
```bash
source dev-env.sh
```

This shows:
- ✅ Node.js version
- ✅ npm version  
- ✅ GitHub CLI version
- ✅ Authentication status
- ✅ Current directory

### Common Issues
1. **"gh: command not found"** → Run `source dev-env.sh`
2. **"Node version wrong"** → Run `nvm use 20`
3. **"Not authenticated"** → Run `gh auth login --web`
4. **"Build fails"** → Run `npm install` again

---

## ✨ You're All Set!

Your development machine is now fully configured for Homestead Architect development.

**Next steps:**
1. Load environment: `source dev-env.sh`
2. Authenticate GitHub CLI: `gh auth login --web`
3. Start developing: `npm run dev`

Happy coding! 🚀

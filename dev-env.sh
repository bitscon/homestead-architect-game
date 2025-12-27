#!/bin/bash
# Homestead Architect - Development Environment Setup
# Source this file before working: source dev-env.sh

echo "🔧 Loading Homestead Architect Development Environment..."

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Use Node v20
nvm use 20 > /dev/null 2>&1

# Add local bin to PATH for GitHub CLI
export PATH="$HOME/.local/bin:$PATH"

# Show versions
echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"
echo "✅ GitHub CLI: $(gh --version | head -1)"
echo "✅ Git: $(git --version)"

# Check GitHub auth status
if gh auth status > /dev/null 2>&1; then
  echo "✅ GitHub CLI: Authenticated"
else
  echo "⚠️  GitHub CLI: Not authenticated (run 'gh auth login')"
fi

echo ""
echo "📂 Working Directory: $(pwd)"
echo "🚀 Ready for development!"
echo ""
echo "Available commands:"
echo "  npm run dev       - Start development server"
echo "  npm run build     - Build for production"
echo "  npm run lint      - Run ESLint"
echo "  gh workflow run   - Trigger GitHub Actions"
echo "  gh pr create      - Create pull request"
echo ""

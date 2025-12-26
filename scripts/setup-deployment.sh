#!/bin/bash

# Homestead Architect - Deployment Setup Script
# This script helps set up SSH keys and GitHub secrets for deployment

set -e

echo "════════════════════════════════════════════════════"
echo "   Homestead Architect - Deployment Setup"
echo "════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
print_info "Checking prerequisites..."

if ! command -v ssh-keygen &> /dev/null; then
    print_error "ssh-keygen not found. Please install OpenSSH client."
    exit 1
fi

if ! command -v git &> /dev/null; then
    print_error "git not found. Please install git."
    exit 1
fi

print_success "Prerequisites OK"
echo ""

# Step 1: SSH Key Generation
echo "════════════════════════════════════════════════════"
echo "Step 1: SSH Key Generation"
echo "════════════════════════════════════════════════════"
echo ""

KEY_NAME="github_deploy_homestead"
KEY_PATH="$HOME/.ssh/$KEY_NAME"

if [ -f "$KEY_PATH" ]; then
    print_warning "SSH key already exists at $KEY_PATH"
    read -p "Do you want to use the existing key? (y/n): " USE_EXISTING
    if [ "$USE_EXISTING" != "y" ]; then
        print_info "Generating new SSH key..."
        ssh-keygen -t ed25519 -C "github-actions-homestead-deploy" -f "$KEY_PATH" -N ""
        print_success "New SSH key generated"
    else
        print_success "Using existing SSH key"
    fi
else
    print_info "Generating SSH key..."
    ssh-keygen -t ed25519 -C "github-actions-homestead-deploy" -f "$KEY_PATH" -N ""
    print_success "SSH key generated at $KEY_PATH"
fi

echo ""

# Step 2: Production Server Information
echo "════════════════════════════════════════════════════"
echo "Step 2: Production Server Information"
echo "════════════════════════════════════════════════════"
echo ""

read -p "Production server hostname or IP (e.g., bitscon.net): " PROD_HOST
read -p "SSH username on production server: " PROD_USER
PROD_APP_PATH="/opt/apps/homestead-architect"

print_info "Configuration:"
echo "  Host: $PROD_HOST"
echo "  User: $PROD_USER"
echo "  Path: $PROD_APP_PATH"
echo ""

# Step 3: Copy SSH Key to Production
echo "════════════════════════════════════════════════════"
echo "Step 3: Copy SSH Key to Production Server"
echo "════════════════════════════════════════════════════"
echo ""

print_info "This will copy the public key to $PROD_HOST"
print_warning "You will be prompted for your SSH password"
echo ""

if ssh-copy-id -i "${KEY_PATH}.pub" "${PROD_USER}@${PROD_HOST}" 2>/dev/null; then
    print_success "SSH public key copied to production server"
else
    print_error "Failed to copy SSH key automatically"
    print_info "Please copy the key manually:"
    echo ""
    echo "  cat ${KEY_PATH}.pub"
    echo ""
    print_info "Then SSH to production and run:"
    echo ""
    echo "  mkdir -p ~/.ssh"
    echo "  echo 'YOUR_PUBLIC_KEY' >> ~/.ssh/authorized_keys"
    echo "  chmod 600 ~/.ssh/authorized_keys"
    echo ""
    read -p "Press Enter when done..."
fi

echo ""

# Step 4: Test SSH Connection
echo "════════════════════════════════════════════════════"
echo "Step 4: Test SSH Connection"
echo "════════════════════════════════════════════════════"
echo ""

print_info "Testing SSH connection..."

if ssh -i "$KEY_PATH" -o BatchMode=yes -o ConnectTimeout=5 "${PROD_USER}@${PROD_HOST}" "echo 'SSH connection successful'" 2>/dev/null; then
    print_success "SSH connection successful!"
else
    print_error "SSH connection failed"
    print_warning "Please verify:"
    echo "  1. Production server is accessible"
    echo "  2. SSH public key was copied correctly"
    echo "  3. Firewall allows SSH (port 22)"
    echo ""
    exit 1
fi

echo ""

# Step 5: Display GitHub Secrets
echo "════════════════════════════════════════════════════"
echo "Step 5: GitHub Secrets Configuration"
echo "════════════════════════════════════════════════════"
echo ""

print_info "Add these secrets to your GitHub repository:"
echo ""
echo "Go to: https://github.com/bitscon/homestead-architect-game/settings/secrets/actions"
echo ""

echo "─────────────────────────────────────────────────────"
echo "Secret Name: PROD_HOST"
echo "Secret Value:"
echo "$PROD_HOST"
echo ""

echo "─────────────────────────────────────────────────────"
echo "Secret Name: PROD_USER"
echo "Secret Value:"
echo "$PROD_USER"
echo ""

echo "─────────────────────────────────────────────────────"
echo "Secret Name: PROD_APP_PATH"
echo "Secret Value:"
echo "$PROD_APP_PATH"
echo ""

echo "─────────────────────────────────────────────────────"
echo "Secret Name: SSH_PRIVATE_KEY"
echo "Secret Value:"
echo ""
cat "$KEY_PATH"
echo ""

echo "─────────────────────────────────────────────────────"
echo ""

print_warning "IMPORTANT: Copy the ENTIRE private key including:"
echo "  -----BEGIN OPENSSH PRIVATE KEY-----"
echo "  and"
echo "  -----END OPENSSH PRIVATE KEY-----"
echo ""

# Step 6: Setup Production Directory
echo "════════════════════════════════════════════════════"
echo "Step 6: Setup Production Directory"
echo "════════════════════════════════════════════════════"
echo ""

print_info "Setting up production directory structure..."
read -p "Do you want to setup the production directory now? (y/n): " SETUP_PROD

if [ "$SETUP_PROD" = "y" ]; then
    print_info "Connecting to production server..."
    
    ssh -i "$KEY_PATH" "${PROD_USER}@${PROD_HOST}" << 'ENDSSH'
        echo "Creating directory structure..."
        sudo mkdir -p /opt/apps
        sudo chown $USER:$USER /opt/apps
        
        if [ ! -d "/opt/apps/homestead-architect" ]; then
            echo "Cloning repository..."
            cd /opt/apps
            git clone https://github.com/bitscon/homestead-architect-game.git homestead-architect
            echo "Repository cloned successfully"
        else
            echo "Repository already exists"
        fi
        
        cd /opt/apps/homestead-architect
        
        if [ ! -f ".env.prod" ]; then
            echo "Creating .env.prod from template..."
            cp .env.prod.example .env.prod
            echo ""
            echo "⚠️  IMPORTANT: Edit .env.prod with your production Supabase credentials:"
            echo "    nano /opt/apps/homestead-architect/.env.prod"
        else
            echo ".env.prod already exists"
        fi
        
        echo ""
        echo "Production directory setup complete!"
ENDSSH
    
    print_success "Production directory setup complete"
    print_warning "Remember to edit .env.prod with your production Supabase credentials!"
else
    print_info "Skipping production directory setup"
    print_info "You can set it up later by SSH'ing to production and running:"
    echo ""
    echo "  sudo mkdir -p /opt/apps && sudo chown \$USER:\$USER /opt/apps"
    echo "  cd /opt/apps"
    echo "  git clone https://github.com/bitscon/homestead-architect-game.git homestead-architect"
    echo "  cd homestead-architect"
    echo "  cp .env.prod.example .env.prod"
    echo "  nano .env.prod  # Edit with production Supabase credentials"
fi

echo ""

# Summary
echo "════════════════════════════════════════════════════"
echo "   Setup Complete!"
echo "════════════════════════════════════════════════════"
echo ""

print_success "SSH key generated and configured"
print_success "Connection to production server verified"
print_info "Next steps:"
echo ""
echo "  1. Add the 4 secrets to GitHub (instructions displayed above)"
echo "  2. Edit .env.prod on production server with Supabase credentials"
echo "  3. Test deployment via GitHub Actions UI"
echo ""

print_info "Deployment workflow location:"
echo "  .github/workflows/deploy.yml"
echo ""

print_info "To deploy:"
echo "  1. Go to: https://github.com/bitscon/homestead-architect-game/actions"
echo "  2. Click 'Deploy to Production' workflow"
echo "  3. Click 'Run workflow'"
echo "  4. Type 'deploy' to confirm"
echo "  5. Watch the logs!"
echo ""

print_info "For detailed documentation, see:"
echo "  - DEPLOYMENT_GUIDE.md"
echo "  - SSH_SETUP_GUIDE.md"
echo ""

print_success "Happy deploying! 🚀"

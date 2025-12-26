# SSH Setup Guide for GitHub Actions Deployment

## Quick Setup

This guide helps you set up SSH keys for automated deployment from GitHub Actions to your production server.

---

## Step 1: Generate SSH Key Pair

On your local machine (barn.workshop.home or your workstation):

```bash
# Generate a new ED25519 SSH key
ssh-keygen -t ed25519 -C "github-actions-homestead-deploy" -f ~/.ssh/github_deploy_homestead

# You'll be prompted:
# Enter file in which to save the key: (press Enter to use the name above)
# Enter passphrase (empty for no passphrase): (press Enter for no passphrase)
# Enter same passphrase again: (press Enter again)
```

**Output:**
```
Your identification has been saved in /home/billybs/.ssh/github_deploy_homestead
Your public key has been saved in /home/billybs/.ssh/github_deploy_homestead.pub
```

---

## Step 2: Copy Public Key to Production Server

```bash
# Copy the public key to bitscon.net
ssh-copy-id -i ~/.ssh/github_deploy_homestead.pub user@bitscon.net

# Replace 'user' with your actual SSH username on bitscon.net
```

**What this does:**
- Adds your public key to `~/.ssh/authorized_keys` on the production server
- Allows passwordless SSH login using the private key

**If ssh-copy-id doesn't work, do it manually:**
```bash
# Display your public key
cat ~/.ssh/github_deploy_homestead.pub

# Copy the output (starts with "ssh-ed25519 ...")

# SSH to production server
ssh user@bitscon.net

# Add the key
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "PASTE_YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
```

---

## Step 3: Test SSH Connection

```bash
# Test the connection using your new key
ssh -i ~/.ssh/github_deploy_homestead user@bitscon.net

# You should be able to login WITHOUT a password
# If prompted for a password, the key setup failed

# Once logged in, test a command:
echo "SSH connection successful!"
exit
```

---

## Step 4: Get Private Key for GitHub

```bash
# Display your PRIVATE key
cat ~/.ssh/github_deploy_homestead
```

**Output will look like:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
... (many lines of random characters) ...
AAAEC3NzaC1lZDI1NTE5AAAAIJQExampleKeyDataHere==
-----END OPENSSH PRIVATE KEY-----
```

**Copy the ENTIRE content** including the BEGIN and END lines.

---

## Step 5: Add SSH Key to GitHub Secrets

1. Go to your GitHub repository: `https://github.com/bitscon/homestead-architect-game`

2. Click **Settings** (tab at top)

3. In left sidebar, click **Secrets and variables** → **Actions**

4. Click **New repository secret**

5. Create the following secrets:

### Secret 1: SSH_PRIVATE_KEY

- **Name:** `SSH_PRIVATE_KEY`
- **Value:** Paste the ENTIRE content from Step 4 (including BEGIN/END lines)
- Click **Add secret**

### Secret 2: PROD_HOST

- **Name:** `PROD_HOST`
- **Value:** `bitscon.net` (or your server's IP address)
- Click **Add secret**

### Secret 3: PROD_USER

- **Name:** `PROD_USER`
- **Value:** Your SSH username on bitscon.net (e.g., `deploy` or `billybs`)
- Click **Add secret**

### Secret 4: PROD_APP_PATH

- **Name:** `PROD_APP_PATH`
- **Value:** `/opt/apps/homestead-architect`
- Click **Add secret**

---

## Step 6: Verify Secrets

After adding all 4 secrets, you should see:

```
SSH_PRIVATE_KEY      Updated X minutes ago
PROD_HOST           Updated X minutes ago
PROD_USER           Updated X minutes ago
PROD_APP_PATH       Updated X minutes ago
```

**Note:** You cannot view secret values after creation (for security). If you made a mistake, delete and recreate the secret.

---

## Step 7: Test Deployment

1. Go to **Actions** tab in your GitHub repository

2. Click on **"Deploy to Production"** workflow

3. Click **"Run workflow"** button

4. Fill in:
   - Branch: `main`
   - Confirm deploy: `deploy`
   - Log level: `debug` (for first test)

5. Click **"Run workflow"**

6. Watch the deployment logs

**Expected output:**
```
🚀 Deploying Homestead Architect to production...
📂 Navigating to application directory...
📥 Fetching latest code from GitHub...
🔨 Building Docker image...
🔄 Deploying updated stack...
⏳ Waiting for service to stabilize...
🏥 Running health checks...
✅ Service is running
✅ Deployment completed successfully!
```

---

## Troubleshooting

### Issue: "Permission denied (publickey)"

**Cause:** Private key not correctly added to GitHub Secrets or public key not on production server.

**Solution:**
```bash
# Verify public key is on production server
ssh user@bitscon.net cat ~/.ssh/authorized_keys

# You should see your key (starts with ssh-ed25519)

# If not there, repeat Step 2

# Verify private key in GitHub Secrets
# Go to Settings → Secrets → SSH_PRIVATE_KEY
# Delete and recreate if unsure
```

### Issue: "Host key verification failed"

**Cause:** Production server's SSH fingerprint not recognized.

**Solution:**
Add this to your GitHub workflow (already included in deploy.yml):
```yaml
- name: Setup SSH
  run: |
    mkdir -p ~/.ssh
    ssh-keyscan -H ${{ secrets.PROD_HOST }} >> ~/.ssh/known_hosts
```

Or manually add host to known_hosts:
```bash
# On development machine
ssh-keyscan bitscon.net >> ~/.ssh/known_hosts
```

### Issue: "Connection timeout"

**Cause:** Firewall blocking SSH or server offline.

**Solution:**
```bash
# Test connection from GitHub Actions runner IP range
# Check if firewall allows SSH (port 22)
# Verify server is online:
ping bitscon.net

# Check SSH service is running on production:
ssh user@bitscon.net systemctl status sshd
```

### Issue: "No such file or directory: /opt/apps/homestead-architect"

**Cause:** Production app directory doesn't exist.

**Solution:**
```bash
# SSH to production
ssh user@bitscon.net

# Create directory structure
sudo mkdir -p /opt/apps
sudo chown $USER:$USER /opt/apps
cd /opt/apps
git clone https://github.com/bitscon/homestead-architect-game.git homestead-architect
```

---

## Security Best Practices

### 1. Use Separate Keys for Different Purposes

```bash
# Personal SSH key
~/.ssh/id_ed25519

# GitHub Actions deployment key
~/.ssh/github_deploy_homestead

# Other services
~/.ssh/gitlab_deploy
~/.ssh/server_backup
```

### 2. Protect Your Private Keys

```bash
# Ensure correct permissions
chmod 600 ~/.ssh/github_deploy_homestead
chmod 644 ~/.ssh/github_deploy_homestead.pub

# Never share private keys
# Never commit private keys to Git
```

### 3. Limit Key Access on Production

```bash
# On production server
# Create a dedicated deployment user (optional but recommended)
sudo adduser github-deploy

# Add to docker group
sudo usermod -aG docker github-deploy

# Use this user in PROD_USER secret
```

### 4. Rotate Keys Periodically

```bash
# Every 6-12 months, generate new keys
# Remove old public keys from production server
# Update GitHub Secrets with new private key
```

### 5. Monitor SSH Access

```bash
# On production server
# Check who's logged in
who

# Check SSH access logs
sudo tail -f /var/log/auth.log | grep sshd

# Set up alerts for suspicious activity
```

---

## SSH Config (Optional but Recommended)

Create `~/.ssh/config` for easier management:

```bash
nano ~/.ssh/config
```

Add:
```
# Production server for Homestead Architect
Host homestead-prod
    HostName bitscon.net
    User your-username
    IdentityFile ~/.ssh/github_deploy_homestead
    Port 22
    ServerAliveInterval 60
    ServerAliveCountMax 3

# Development server
Host homestead-dev
    HostName barn.workshop.home
    User billybs
    IdentityFile ~/.ssh/id_ed25519
```

Now you can use:
```bash
# Instead of: ssh user@bitscon.net
ssh homestead-prod

# Instead of: ssh billybs@barn.workshop.home
ssh homestead-dev
```

---

## Quick Reference

### Commands

| Task | Command |
|------|---------|
| Generate new SSH key | `ssh-keygen -t ed25519 -C "comment" -f ~/.ssh/keyname` |
| Copy key to server | `ssh-copy-id -i ~/.ssh/keyname.pub user@server` |
| Test SSH connection | `ssh -i ~/.ssh/keyname user@server` |
| View public key | `cat ~/.ssh/keyname.pub` |
| View private key | `cat ~/.ssh/keyname` (for GitHub Secrets) |
| List SSH keys | `ls -la ~/.ssh/` |
| Check key permissions | `ls -l ~/.ssh/keyname` (should be 600) |
| Fix permissions | `chmod 600 ~/.ssh/keyname` |

### Paths

| Item | Path |
|------|------|
| SSH keys directory | `~/.ssh/` |
| Private key | `~/.ssh/github_deploy_homestead` |
| Public key | `~/.ssh/github_deploy_homestead.pub` |
| SSH config | `~/.ssh/config` |
| Authorized keys (prod) | `~/.ssh/authorized_keys` on bitscon.net |

---

**Document Version:** 1.0  
**Last Updated:** December 26, 2025  
**Status:** ✅ READY FOR USE

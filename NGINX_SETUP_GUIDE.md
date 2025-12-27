# Nginx Setup Guide for mybarn.barn.workshop.home

## 📋 Overview

This guide explains how to configure nginx on **barn.workshop.home** to proxy **https://mybarn.barn.workshop.home** to the Homestead Architect Docker container running on **ai.workshop.home:8081**.

**Configuration replicates:** vault.barn.workshop.home setup

---

## 🎯 Quick Setup

### Automated (if SSH works)

```bash
cd /home/billybs/apps/homestead-architect
./setup-nginx-barn.sh
```

### Manual Setup

Follow the steps below if SSH doesn't work or you prefer manual configuration.

---

## 📝 Manual Deployment Steps

### Step 1: Copy Config to barn.workshop.home

From this DEV machine:

```bash
cd /home/billybs/apps/homestead-architect
scp nginx-mybarn.conf billybs@barn.workshop.home:/tmp/
```

### Step 2: SSH into barn.workshop.home

```bash
ssh billybs@barn.workshop.home
```

### Step 3: Install Nginx Config

On barn.workshop.home:

```bash
# Move config to sites-available
sudo mv /tmp/nginx-mybarn.conf /etc/nginx/sites-available/mybarn.barn.workshop.home

# Create symbolic link to sites-enabled
sudo ln -s /etc/nginx/sites-available/mybarn.barn.workshop.home /etc/nginx/sites-enabled/

# Set proper permissions
sudo chown root:root /etc/nginx/sites-available/mybarn.barn.workshop.home
sudo chmod 644 /etc/nginx/sites-available/mybarn.barn.workshop.home
```

### Step 4: Verify Nginx Configuration

```bash
# Test nginx configuration
sudo nginx -t

# Expected output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Step 5: Reload Nginx

```bash
# Reload nginx to apply changes
sudo systemctl reload nginx

# Or restart if needed
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

### Step 6: Verify Deployment

```bash
# Test from barn.workshop.home
curl -I http://localhost
curl -k -I https://mybarn.barn.workshop.home

# Check nginx logs
sudo tail -f /var/log/nginx/mybarn.barn.workshop.home.access.log
sudo tail -f /var/log/nginx/mybarn.barn.workshop.home.error.log
```

---

## 🔧 Configuration Details

### What the Config Does

1. **HTTP → HTTPS Redirect**
   - All HTTP traffic on port 80 redirects to HTTPS

2. **SSL/TLS Termination**
   - Handles HTTPS on port 443
   - Uses existing barn.workshop.home SSL certificates

3. **Reverse Proxy**
   - Proxies requests to: `http://ai.workshop.home:8081`
   - Passes proper headers for client IP and protocol

4. **WebSocket Support**
   - Enables WebSocket for Vite Hot Module Replacement (HMR)
   - Essential for development hot reload

5. **Security Headers**
   - X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
   - Enhances security for the application

---

## 🔐 SSL Certificate Paths

The config assumes these SSL certificate paths (matching vault.barn.workshop.home):

```nginx
ssl_certificate /etc/ssl/certs/barn.workshop.home.crt;
ssl_certificate_key /etc/ssl/private/barn.workshop.home.key;
```

### If Using Different Certificates

Edit the nginx config on barn.workshop.home:

```bash
sudo nano /etc/nginx/sites-available/mybarn.barn.workshop.home

# Update these lines:
ssl_certificate /path/to/your/cert.crt;
ssl_certificate_key /path/to/your/key.key;
```

### If Using Let's Encrypt

```bash
# Certificate paths for Let's Encrypt
ssl_certificate /etc/letsencrypt/live/mybarn.barn.workshop.home/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/mybarn.barn.workshop.home/privkey.pem;

# You may also want to add:
ssl_trusted_certificate /etc/letsencrypt/live/mybarn.barn.workshop.home/chain.pem;
```

---

## 🌐 DNS Configuration

Ensure DNS is configured for **mybarn.barn.workshop.home**:

### Local DNS (if using local DNS server)

Add A record pointing to barn.workshop.home IP address:

```
mybarn.barn.workshop.home    A    <barn-ip-address>
```

### /etc/hosts (temporary testing)

On your local machine:

```bash
# Add to /etc/hosts
<barn-ip-address>  mybarn.barn.workshop.home
```

---

## 🧪 Testing & Verification

### From barn.workshop.home

```bash
# Test nginx config
sudo nginx -t

# Test proxy pass
curl http://ai.workshop.home:8081

# Test local nginx
curl -k https://localhost -H "Host: mybarn.barn.workshop.home"
```

### From DEV machine (ai.workshop.home)

```bash
# Test DNS resolution
nslookup mybarn.barn.workshop.home

# Test HTTPS connection
curl -k https://mybarn.barn.workshop.home

# Test with browser
firefox https://mybarn.barn.workshop.home
```

### From any machine on network

```bash
# Access the application
https://mybarn.barn.workshop.home
```

---

## 🐛 Troubleshooting

### Nginx config test fails

```bash
# Check syntax errors
sudo nginx -t

# View detailed error
sudo tail -50 /var/log/nginx/error.log
```

**Common issues:**
- Missing semicolons
- Incorrect file paths
- Port already in use

### 502 Bad Gateway

**Cause:** Nginx can't reach the upstream server (ai.workshop.home:8081)

**Solutions:**

```bash
# 1. Verify container is running on ai.workshop.home
ssh ai.workshop.home "docker ps | grep homestead"

# 2. Test connectivity from barn to ai
ssh barn.workshop.home "curl http://ai.workshop.home:8081"

# 3. Check firewall on ai.workshop.home
ssh ai.workshop.home "sudo ufw status"

# 4. Verify nginx error logs
sudo tail -f /var/log/nginx/mybarn.barn.workshop.home.error.log
```

### 404 Not Found

**Cause:** Nginx is working but upstream returns 404

**Solutions:**

```bash
# 1. Check application logs on ai.workshop.home
docker compose --profile dev logs frontend-dev

# 2. Test direct access to container
curl http://ai.workshop.home:8081

# 3. Verify proxy_pass URL in nginx config
grep proxy_pass /etc/nginx/sites-available/mybarn.barn.workshop.home
```

### SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in /etc/ssl/certs/barn.workshop.home.crt -text -noout

# Check certificate expiration
openssl x509 -in /etc/ssl/certs/barn.workshop.home.crt -enddate -noout

# Test SSL connection
openssl s_client -connect mybarn.barn.workshop.home:443
```

### WebSocket/HMR Not Working

**Issue:** Hot reload doesn't work in development

**Solution:** Ensure WebSocket headers are set:

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

Already included in the config ✅

---

## 📊 Nginx UI Configuration

If you're using **Nginx Proxy Manager** or similar UI tool:

### Add Host Configuration

1. **Domain Names:** `mybarn.barn.workshop.home`
2. **Scheme:** `http`
3. **Forward Hostname/IP:** `ai.workshop.home`
4. **Forward Port:** `8081`
5. **Websockets Support:** `ON` ✅
6. **SSL:** Use existing barn.workshop.home certificate
7. **Force SSL:** `ON` ✅

### Custom Nginx Configuration

Add to "Advanced" tab:

```nginx
proxy_set_header X-Forwarded-Host $server_name;
proxy_buffering off;
proxy_request_buffering off;
```

---

## 🔄 Maintenance

### Update Configuration

```bash
# Edit config
sudo nano /etc/nginx/sites-available/mybarn.barn.workshop.home

# Test changes
sudo nginx -t

# Apply changes
sudo systemctl reload nginx
```

### View Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/mybarn.barn.workshop.home.access.log

# Error logs
sudo tail -f /var/log/nginx/mybarn.barn.workshop.home.error.log

# Combined
sudo tail -f /var/log/nginx/mybarn.barn.workshop.home.*.log
```

### Disable Site

```bash
# Remove symbolic link
sudo rm /etc/nginx/sites-enabled/mybarn.barn.workshop.home

# Reload nginx
sudo systemctl reload nginx
```

### Re-enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/mybarn.barn.workshop.home /etc/nginx/sites-enabled/

# Reload nginx
sudo systemctl reload nginx
```

---

## 📁 File Locations

**On barn.workshop.home:**

| File/Directory | Purpose |
|----------------|---------|
| `/etc/nginx/sites-available/mybarn.barn.workshop.home` | Main config file |
| `/etc/nginx/sites-enabled/mybarn.barn.workshop.home` | Symbolic link (active) |
| `/var/log/nginx/mybarn.barn.workshop.home.access.log` | Access logs |
| `/var/log/nginx/mybarn.barn.workshop.home.error.log` | Error logs |
| `/etc/ssl/certs/barn.workshop.home.crt` | SSL certificate |
| `/etc/ssl/private/barn.workshop.home.key` | SSL private key |

**On ai.workshop.home (DEV):**

| File/Directory | Purpose |
|----------------|---------|
| `/home/billybs/apps/homestead-architect/nginx-mybarn.conf` | Nginx config template |
| `/home/billybs/apps/homestead-architect/setup-nginx-barn.sh` | Deployment script |

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Nginx config test passes: `sudo nginx -t`
- [ ] Nginx service is running: `sudo systemctl status nginx`
- [ ] Site config is linked: `ls -l /etc/nginx/sites-enabled/ | grep mybarn`
- [ ] Container is running on ai: `docker ps | grep homestead`
- [ ] DNS resolves: `nslookup mybarn.barn.workshop.home`
- [ ] HTTP redirects to HTTPS: `curl -I http://mybarn.barn.workshop.home`
- [ ] HTTPS is accessible: `curl -k https://mybarn.barn.workshop.home`
- [ ] Application loads in browser: Open https://mybarn.barn.workshop.home
- [ ] Hot reload works (dev mode): Make a code change, see it reflect
- [ ] Logs are being written: `ls -lh /var/log/nginx/mybarn*`

---

## 🆘 Support

**Files Created:**
- `nginx-mybarn.conf` - Nginx configuration
- `setup-nginx-barn.sh` - Automated deployment script
- `NGINX_SETUP_GUIDE.md` - This guide

**Related Documentation:**
- `DOCKER_BARN_DEPLOYMENT.md` - Docker setup
- `DEV_SETUP.md` - Development environment
- `README.md` - Project overview

---

**Last Updated:** December 27, 2025  
**Configured By:** OpenCode AI Assistant  
**Status:** Ready for deployment

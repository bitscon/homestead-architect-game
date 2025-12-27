NGINX CONFIGURATION FOR MYBARN.BARN.WORKSHOP.HOME
==================================================

FILES IN THIS DIRECTORY:
-----------------------
✅ nginx-mybarn.conf       - Nginx reverse proxy configuration
✅ setup-nginx-barn.sh     - Automated deployment script  
✅ NGINX_SETUP_GUIDE.md    - Complete setup documentation


WHAT THIS DOES:
--------------
- Creates nginx reverse proxy on barn.workshop.home
- Points https://mybarn.barn.workshop.home → http://ai.workshop.home:8081
- Replicates vault.barn.workshop.home configuration
- Enables SSL/TLS with existing barn.workshop.home certificates
- Supports WebSocket for Vite Hot Module Replacement


QUICK START (3 OPTIONS):
-----------------------

1. AUTOMATED (if SSH configured):
   ./setup-nginx-barn.sh

2. MANUAL DEPLOYMENT:
   scp nginx-mybarn.conf billybs@barn.workshop.home:/tmp/
   ssh billybs@barn.workshop.home
   sudo mv /tmp/nginx-mybarn.conf /etc/nginx/sites-available/mybarn.barn.workshop.home
   sudo ln -s /etc/nginx/sites-available/mybarn.barn.workshop.home /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx

3. NGINX UI (Proxy Manager):
   - Domain: mybarn.barn.workshop.home
   - Forward to: ai.workshop.home:8081
   - WebSockets: ON
   - Force SSL: ON


VERIFICATION:
------------
1. Container running: docker ps | grep homestead
2. Test config: ssh barn.workshop.home "sudo nginx -t"
3. Test access: curl -k https://mybarn.barn.workshop.home
4. Browser: https://mybarn.barn.workshop.home


CURRENT STATUS:
--------------
✅ Docker container running on ai.workshop.home (port 8081)
✅ Nginx config file created
✅ Deployment script ready
⏳ Waiting for deployment to barn.workshop.home


NEED HELP?
---------
Read: NGINX_SETUP_GUIDE.md for detailed instructions

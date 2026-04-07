#!/bin/bash
# Update and install required packages
apt-get update -y
apt-get install -y nginx python3-pip python3-venv git curl
# Install Node.js (LTS)
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
  apt-get install -y nodejs
fi
# Clone your repo (replace with your repo URL if needed)
if [ ! -d /home/ubuntu/eodbod ]; then
  git clone https://github.com/yourusername/eodbod.git /home/ubuntu/eodbod
fi
cd /home/ubuntu/eodbod
# Checkout main branch and pull latest
sudo -u ubuntu git checkout main
sudo -u ubuntu git pull origin main
# Backend setup
cd 2026-eodbod/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Setup systemd service for backend
cat <<EOF > /etc/systemd/system/eodbod-backend.service
[Unit]
Description=Eodbod Flask Backend
After=network.target
[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/eodbod/2026-eodbod/backend
ExecStart=/home/ubuntu/eodbod/2026-eodbod/backend/venv/bin/python3 form_api.py
Restart=always
[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable eodbod-backend
systemctl restart eodbod-backend
# Frontend build and deploy
cd /home/ubuntu/eodbod/2026-eodbod/frontend
npm install
npm run build || echo "No build script defined"
cp -r dist/* /var/www/html/
# Nginx config
cat <<EOF > /etc/nginx/sites-available/default
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    root /var/www/html;
    index index.html;
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location /admin/ {
        proxy_pass http://127.0.0.1:8000/admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location / {
        try_files $uri $uri/ =404;
    }
}
EOF
systemctl restart nginx

# Virtual Host Configuration for dev.ccollins.io

upstream frontend {
	server localhost:3000;
}

#upstream backend {
#	server localhost:3001;
#}

server {
    # SSL configuration
    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/dev.ccollins.io/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/dev.ccollins.io/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

    server_name dev.ccollins.io;
	
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
	proxy_set_header Upgrade $http_upgrade;
	proxy_set_header Connection 'upgrade';
	proxy_set_header Host $host;
	proxy_cache_bypass $http_upgrade;
    }
	
#    location /api/ {
#        proxy_pass http://backend/api/;
#	proxy_http_version 1.1;
#	proxy_set_header Upgrade $http_upgrade;
#	proxy_set_header Connection 'upgrade';
#	proxy_set_header Host $host;
#	proxy_cache_bypass $http_upgrade;
#    }
}

# Redirect HTTP to HTTPS for dev.ccollins.io 
server {
    if ($host = dev.ccollins.io) {
        return 301 https://$host$request_uri;
    }

    listen 80 default_server;
    listen [::]:80 default_server;

    server_name dev.ccollins.io;
    return 404; 
}

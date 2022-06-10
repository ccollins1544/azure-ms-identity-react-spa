# Virtual Host Configuration for test.ccollins.io

upstream react_test {
    server localhost:3002;
}

server {
    # SSL configuration
    listen [::]:443 ssl; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/test.ccollins.io/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/test.ccollins.io/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

    server_name test.ccollins.io;
	
    location / {
        proxy_pass http://react_test;
        proxy_http_version 1.1;
	proxy_set_header Upgrade $http_upgrade;
	proxy_set_header Connection 'upgrade';
	proxy_set_header Host $host;
	proxy_cache_bypass $http_upgrade;
    }
}


server {
    if ($host = test.ccollins.io) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    # disabled in case I decide to use port 80 for testing later 
    #listen 80 default_server;
    #listen [::]:80 default_server;

    server_name test.ccollins.io;
    return 404; # managed by Certbot
}

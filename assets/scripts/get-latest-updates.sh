#!/bin/bash

pm2 stop azure_spa_main
cd ~/azure_spa_main/source 
git reset --hard HEAD
git pull
npm install
#npm rebuild bcrypt --build-from-source
#node scripts/init.js

rsync -avu ~/azure_spa_main/source/assets/pm2/ecosystem.config.js ~/ecosystem.config.js

pm2 startOrRestart ecosystem.config.js --only azure_spa_main --env production
sudo systemctl restart nginx

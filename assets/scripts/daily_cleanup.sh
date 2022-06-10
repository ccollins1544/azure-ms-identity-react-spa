#!/bin/bash

# REMOVE OLD _DOWNLOADS
find ~/logs/ -type f -mtime +7 -exec rm {} +
find ~/downloads/ -type f -mtime +7 -exec rm {} +
find ~/downloads/ -empty -type d -delete

# REMOVE OLD LOGS
cp ~/.pm2/pm2.log ~/backups/backups/pm2_$(hostname)_$(date +%m.%d.%Y.%H%M%S).log
pm2 flush
pm2 reloadLogs
echo "" >~/.pm2/pm2.log

# Restore main folder incase it got deleted for being empty
mkdir -p ~/Downloads
mkdir -p ~/logs

# Restart pm2
pm2 restart all
sudo systemctl restart nginx


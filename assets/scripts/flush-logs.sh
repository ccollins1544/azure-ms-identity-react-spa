#!/bin/bash
cp ~/.pm2/pm2.log ~/backups/pm2_`hostname`_`date +%m.%d.%Y.%H%M%S`.log
pm2 flush
pm2 reloadLogs
echo "" > ~/.pm2/pm2.log

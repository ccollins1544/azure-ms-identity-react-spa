#!/bin/bash

# REMOVE OLD BACKUPS
find ~/backups -type f -mtime +15 -exec rm {} +

# BACKUP SCRIPTS
tar -cvf ~/backups/`date +%m.%d.%Y`_scripts.tar.gz ~/scripts/

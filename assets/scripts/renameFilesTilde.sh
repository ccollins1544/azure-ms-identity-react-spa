#!/bin/bash
# This script is for renaming files in our _downloads folder with tilde ("~") to underscore("_")
# 
# Usage: 
# ./renameFilesTilde.sh
# ./renameFilesTilde.sh /mnt/efs/fs1/_downloads
# 
##########################################################################
# PATHS 
_self="${0##*/}" # get this file name
LOG_FILE="/mnt/efs/fs1/logs/$(echo ${_self} | sed -r 's/.sh/.log/')"
#LOG_FILE="$(echo ${_self} | sed -r 's/.sh/.log/')"

# COLORS 
RED='\033[0;31m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# ===========[ Collect Arguments ]====================
if [ $# -eq 0 ]
  then
    export DOWNLOADS_PATH='/mnt/efs/fs1/_downloads'
  else
    export DOWNLOADS_PATH=$1
fi

# ===========[ MAIN SCRIPT ]====================
rm $LOG_FILE
printf "${CYAN}Running ${_self}${NC}\n" | tee -a $LOG_FILE
printf "${YELLOW}START TIME: `date +%c`${NC}\n" | tee -a $LOG_FILE
printf "${CYAN}DOWNLOADS_PATH: ${DOWNLOADS_PATH}${NC}\n" | tee -a $LOG_FILE

find ${DOWNLOADS_PATH} -type f -name '~*.pdf' | while read FILE; do   
  newFile="${FILE//[~]/_}";
  printf "$(du -sh "${FILE}" | cut -f -1)\tRenaming ${CYAN}${FILE}${NC}\t${YELLOW}==>${NC}\t${GREEN}${newFile}${NC}\n" | tee -a $LOG_FILE
  
  # move the file
  mv "${FILE}" "${FILE//[~]/_}"
done

printf "${GREEN}END TIME: `date +%c`${NC}\n\n\n" | tee -a $LOG_FILE

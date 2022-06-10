#!/bin/bash
# This script is for renaming files from 9F_A.pdf ==> A.pdf
# Basically keeping the right side of the underscore only. 
# 
# This is used for converting raw downloads for testing generatePDF001
# 
# Usage: 
# ./renameFiles_.sh
# ./renameFiles_.sh /mnt/efs/fs1/_downloads/tests/exhibits/
##########################################################################
# PATHS 
_self="${0##*/}" # get this file name
LOG_FILE="/mnt/efs/fs1/logs/$(echo ${_self} | sed -r 's/.sh/.log/')"

# COLORS
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'
NC='\033[0m' # no color 

# ===========[ Collect Arguments ]====================
if [ $# -eq 0 ]
  then
    export SOURCE_PATH='/mnt/efs/fs1/_downloads/tests/exhibits/'
  else
    export SOURCE_PATH=$1
    LOG_FILE="$1$(echo ${_self} | sed -r 's/.sh/.log/')"
fi

# ===========[ MAIN SCRIPT ]====================
touch $LOG_FILE
rm $LOG_FILE
printf "${CYAN}Running ${_self}${NC}\n" | tee -a $LOG_FILE
printf "${YELLOW}START TIME: `date +%c`${NC}\n" | tee -a $LOG_FILE
printf "${CYAN}SOURCE_PATH: ${SOURCE_PATH}${NC}\n" | tee -a $LOG_FILE

find ${SOURCE_PATH} -type f -name '*.pdf' | while read FILE; do   
  newFile="${FILE#"${FILE%_*}_"}";   
  printf "$(du -sh "${FILE}" | cut -f -1)\tRenaming ${CYAN}${FILE}${NC}\t${YELLOW}==>${NC}\t${GREEN}${newFile}${NC}\n" | tee -a $LOG_FILE
  
  # move the file
  mv "${FILE}" "$SOURCE_PATH${FILE#"${FILE%_*}_"}"
done

printf "${GREEN}END TIME: `date +%c`${NC}\n\n\n" | tee -a $LOG_FILE

#!/bin/bash
# This script is for installing and setting up NConvert 
# 
# Official Website: https://www.xnview.com/en/nconvert/
# Wiki: https://www.xnview.com/wiki/index.php?title=NConvert_User_Guide
# 
# Once installed we can run the conversion command. For example,
# nconvert -out pdf -multi -overwrite -keepfiledate -keepcspace -c 5 -c_grey 0 -c_bw 0 -q 60 -o % bad.tiff 
# 
# Usage: 
# ./install-nconvert.sh 
##########################################################################
# PATHS 
_self="${0##*/}" # get this file name
LOG_FILE="$HOME/$(echo ${_self} | sed -r 's/.sh/.log/')"
DOWNLOAD_PATH="$HOME/Downloads"
ARCH=$(uname -m)

# COLORS
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'
NC='\033[0m' # no color 

# ===========[ MAIN SCRIPT ]====================
mkdir -p $DOWNLOAD_PATH

if [[ -f $LOG_FILE ]]; then 
  printf "${CYAN}Removing old log file $LOG_FILE${NC}\n"
  rm $LOG_FILE
else 
  printf "${CYAN}Creating log file $LOG_FILE${NC}\n"
fi

touch $LOG_FILE
printf "${CYAN}✔ Running ${_self}${NC}\n"             | tee -a $LOG_FILE
printf "${YELLOW}⏳ START TIME: `date +%c`${NC}\n"     | tee -a $LOG_FILE
printf "${CYAN}DOWNLOAD_PATH: ${DOWNLOAD_PATH}${NC}\n" | tee -a $LOG_FILE

printf "${CYAN}=========[ ✔ Installing Updates ]==============================${NC}\n" | tee -a $LOG_FILE
sudo apt update && sudo apt upgrade -y
sudo apt update && sudo apt dist-upgrade -y
sudo apt autoremove -y

printf "${CYAN}=========[ ✔ Downloading NConvert ]============================${NC}\n" | tee -a $LOG_FILE
if [ $ARCH == "x86_64" ]; then
  printf "${BLUE}Downloading 64bit version${NC}\n" | tee -a $LOG_FILE
  wget http://download.xnview.com/NConvert-linux64.tgz -P $DOWNLOAD_PATH
  tar -xvf $DOWNLOAD_PATH/NConvert-linux64.tgz --directory $DOWNLOAD_PATH
else
  printf "${BLUE}Downloading 32bit version${NC}\n" | tee -a $LOG_FILE
  wget http://download.xnview.com/NConvert-linux.tgz -P $DOWNLOAD_PATH
  tar -xvf $DOWNLOAD_PATH/NConvert-linux.tgz --directory $DOWNLOAD_PATH 
fi

printf "${CYAN}=========[ ✔ Installing Dependencies ]=========================${NC}\n" | tee -a $LOG_FILE
sudo cp $DOWNLOAD_PATH/NConvert/nconvert /usr/local/bin/.
printf "${BLUE}NConvert is installed at: $(which nconvert)${NC}\n" | tee -a $LOG_FILE 

printf "${CYAN}=========[ ✔ Cleaning Up Files ]=========================${NC}\n" | tee -a $LOG_FILE
if [[ -d $HOME/NConvert ]]; then 
  printf "${CYAN}Directory exists: $HOME/NConvert ${NC}\n"                        | tee -a $LOG_FILE
else 
  mv $DOWNLOAD_PATH/NConvert $HOME/
fi 
rm $DOWNLOAD_PATH/NConvert-linux*tgz*

printf "${BLUE}Creating $HOME/NConvert/nchelp.txt${NC}\n\n"                         | tee -a $LOG_FILE
nconvert -help > $HOME/NConvert/nchelp.txt

printf "${BLUE}---------[ ✔ Usage ]-------------------------------------${NC}\n" | tee -a $LOG_FILE
printf "${BLUE}See $HOME/NConvert/nchelp.txt for example usage.${NC}\n"                    | tee -a $LOG_FILE
printf "${BLUE}\nHere is a sample command to convert bad.tiff to bad.pdf,${NC}\n" | tee -a $LOG_FILE

# NOTE: If you're reading this script please note that the following command should only have ONE % sign 
# there is two so that it correctly shows ONE % for the printf command 
printf "${GREEN}nconvert -out pdf -multi -overwrite -keepfiledate -keepcspace -c 5 -c_grey 0 -c_bw 0 -q 60 -o %% bad.tiff${NC}\n" | tee -a $LOG_FILE

# Bulk Conversion Example 
printf "${BLUE}\nFor bulk conversion you can navigate to a directory full of tiff files and run the following commands (MULTI LINE COMMANDS),${NC}\n" | tee -a $LOG_FILE
printf "${GREEN}find . -type f -name '*.tif*' | while read TIFF_FILE; do${NC}\n" | tee -a $LOG_FILE
printf "${GREEN}  printf \"Converting "$'\x24'"TIFF_FILE to PDF\\\n\"${NC}\n"    | tee -a $LOG_FILE
printf "${GREEN}  nconvert -out pdf -multi -overwrite -keepfiledate -keepcspace -c 5 -c_grey 0 -c_bw 0 -q 60 -o %% "$'\x24'"TIFF_FILE${NC}\n" | tee -a $LOG_FILE
printf "${GREEN}  mkdir tiff_files${NC}\n"                                       | tee -a $LOG_FILE
printf "${GREEN}  mv "$'\x24'"TIFF_FILE tiff_files/"$'\x24'"TIFF_FILE${NC}\n"    | tee -a $LOG_FILE
printf "${GREEN}done${NC}\n"                                                     | tee -a $LOG_FILE
printf "${BLUE}--------------------------------------------------------${NC}\n"  | tee -a $LOG_FILE

printf "${YELLOW}⏳ END TIME: `date +%c`${NC}\n\n\n" | tee -a $LOG_FILE


################################################################################
# Windows installation
#
# 1) Download the zip file 
# 32bit - http://download.xnview.com/NConvert-win.zip
# 64bit - http://download.xnview.com/NConvert-win64.zip
#
# 2) Extract the file and copy the nconvert.exe to C:\Windows\System32\nconvert.exe
#
# 3) Add Environment Variables. 
#   This PC > Properties > Advanced System Settings > Environment Variables
#   Under System Variables click New and add the path to C:\Windows\System32\nconvert.exe and call it nconvert
#
# 4) Close and save. Now you should be able to press [WindowKey] + r, type "cmd" and press [enter], and type "nconvert -help" and press [enter]
# That's it!
################################################################################


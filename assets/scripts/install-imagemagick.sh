#!/bin/bash

##########################################################################
# Install ImageMagick 
# by Christopher Collins
#
# NOTE: 
# Ghostscript and Freetype are prerequisites, otherwise expect the EPS, PS, PDF and text annotations tests to fail.
# 
# For more details see https://imagemagick.org/script/install-source.php#unix
##########################################################################

#echo "===============[ Removing Everything ]========================"
#sudo apt remove --purge imagemagick* -y 
#sudo apt remove --purge ghostscript* -y
#sudo apt remove --purge ghostscript-x -y 
#sudo apt remove --purge libltdl-dev* -y 
#sudo apt remove --purge freetype2-doc* -y 
#sudo apt remove --purge libtiff-dev* -y
#sudo apt autoremove -y

echo "";
echo "=========[ Installing Updates ]=============================="
sudo apt update && sudo apt upgrade -y
sudo apt update && sudo apt dist-upgrade -y
sudo apt autoremove -y

echo "";
echo "=========[ Installing Dependencies ]=============================="
sudo apt install make -y
sudo apt install ghostscript -y
sudo apt install ghostscript-x -y 
echo "----------------------------------------------------------------"
sudo apt install libltdl-dev -y 
echo "----------------------------------------------------------------"
sudo apt-get install freetype2-doc -y 
echo "----------------------------------------------------------------"
sudo apt install libtiff-dev -y 

echo "";
echo "==========[ Downloading ImageMagick ]============================="
# Official Latest Release
wget https://www.imagemagick.org/download/ImageMagick.tar.gz
tar -xvzf ImageMagick.tar.gz
cd ImageMagick-*

# 6.6.3-10 
#wget https://download.imagemagick.org/ImageMagick/download/releases/ImageMagick-6.6.3-10.tar.xz
#tar -xvf ImageMagick-*
#cd ImageMagick-6.6.3-10/

echo "";
echo "=========[ Configuring ImageMagick ]========================"
./configure --with-modules --with-gslib=yes

echo "";
echo "=========[ MAKE ]=============================="
make

echo "";
echo "==========[ MAKE Install ]========================"
sudo make install 
sudo ldconfig /usr/local/lib 

echo "";
echo "===========[ Checking Formats ]============================"

identify -version

echo "";
echo "NOTE: The following command can be used to verify you can handle the file type"
echo "identify -verbose test.tiff"


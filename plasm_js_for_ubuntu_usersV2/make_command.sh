#! /bin/bash
#Autore: Andrea Iuliano
#Versione 2.0 

INSPATH=$1

BRC=$(pwd | awk -v FS="/" '{print "/"$2"/"$3"/.bashrc"}')

echo "Inserire l'alias che si desidera usare"
read ALIAS
echo "" >> $BRC
echo "#Command for plams.js" >> $BRC
echo "alias "$ALIAS"=\"$(echo $INSPATH)./executePlasmJS.sh\"" >> $BRC

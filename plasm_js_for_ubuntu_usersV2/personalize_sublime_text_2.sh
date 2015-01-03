#! /bin/bash
#Autore: Andrea Iuliano
#Versione 2.0 

INSPATH=$1
STPATH="~/.config/sublime-text-2/Packages/User/"
TMPPATH=$(pwd | awk -v FS="/" '{print "/"$2"/"$3}')
STPATH=$(echo $STPATH | sed "s@~@$TMPPATH@g")

PLPATH=$(echo $STPATH)"plasm.js.sublime-build"

if test -s "$PLPATH"; then
	echo "come si vuole chiamare l'ambiente? plasm.js è già esistente"
	read BSNAME
else 
	BSNAME="plasm.js"
fi

BSNAME=$(echo $BSNAME)".sublime-build"

BDSYS=$(echo $STPATH)"$BSNAME"

echo "{" > $BDSYS
echo '	"cmd": ["'$(echo $INSPATH)'executePlasmJS.sh $file"],' >> $BDSYS
echo '	"shell" : true' >> $BDSYS
echo "}" >> $BDSYS

echo "Sublime Text è stato configurato. Selezionare $BSNAME da Tools -> Build System"

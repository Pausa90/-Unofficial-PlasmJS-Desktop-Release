#! /bin/bash
#Autore: Andrea Iuliano
#Versione 1.0 

INSPATH=$1

#Scaricare plasm.js
git clone https://github.com/cvdlab/plasm.js

#Installare plasm.js
mv plasm.js "$INSPATH"

NPMLPOS=$(echo "$INSPATH")"plasm.js/"
POS=$(pwd)
cd "$NPMLPOS"
#npm install
cd "$POS"

#Creo executePlasmJS
echo '#!/bin/bash' > executePlasmJS.sh
echo '#Author: Andrea Iuliano' >> executePlasmJS.sh
echo >> executePlasmJS.sh
echo '#Leggo il file passato in input' >> executePlasmJS.sh
echo 'FILE="$@"' >> executePlasmJS.sh
echo  >> executePlasmJS.sh
echo '#Gestisco la ~' >> executePlasmJS.sh
echo 'TILDE=$(echo $FILE | grep '^~')' >> executePlasmJS.sh
echo 'if test ! "$TILDE" = ""; then' >> executePlasmJS.sh
echo '	TMPPATH=$(pwd | awk -v FS="/" '{print "/"$2"/"$3}')' >> executePlasmJS.sh
echo '	FILE=$(echo $FILE | sed "s@~@$TMPPATH@g")' >> executePlasmJS.sh
echo 'fi' >> executePlasmJS.sh
echo >> executePlasmJS.sh
echo "#Va inserito il path dell'installazione di di plasm.js" >> executePlasmJS.sh
echo "INSPATH=\"$INSPATH\"" >> executePlasmJS.sh
echo 'INPUT=$(echo $INSPATH)inputScript.js' >> executePlasmJS.sh
echo >> executePlasmJS.sh
echo '#Controllo se il file esiste' >> executePlasmJS.sh
echo 'if test ! -s "$FILE"; then' >> executePlasmJS.sh
echo '	echo "$FILE non esiste"' >> executePlasmJS.sh
echo 'else' >> executePlasmJS.sh
echo '	#Creo il file che sarà usato come input' >> executePlasmJS.sh
echo '	echo "/** File utilizzato come input per pyplasm, non modificare **/" > "$INPUT"' >> executePlasmJS.sh
echo >> executePlasmJS.sh
echo '	#Inizializzo le variabili ausiliarie' >> executePlasmJS.sh
echo '	NUMROWS=$(wc -l "$FILE" | awk '"'"'{print $1}'"'"')' >> executePlasmJS.sh
echo '	let NUMROWS+=1' >> executePlasmJS.sh
echo '	I=1' >> executePlasmJS.sh
echo '	#Copio il file' >> executePlasmJS.sh
echo '	while [ $I -le $NUMROWS ]; do' >> executePlasmJS.sh
echo '		ROW=$(sed -n "${I}p" "$FILE")' >> executePlasmJS.sh
echo '		echo "$ROW" >> "$INPUT"' >> executePlasmJS.sh
echo '		let I+=1' >> executePlasmJS.sh
echo '	done' >> executePlasmJS.sh
echo  >> executePlasmJS.sh
echo '	#Avvio plasm' >> executePlasmJS.sh
echo '	open -a "Google Chrome" --args --kiosk  $(echo $INSPATH)plasm.js/index.html' >> executePlasmJS.sh
echo 'fi' >> executePlasmJS.sh


echo '/** File utilizzato come input per pyplasm, non modificare **/' >> inputScript.js
mv inputScript.js $INSPATH

#Inserire i file decompressi per lo script
chmod +x executePlasmJS.sh
mv executePlasmJS.sh "$INSPATH"
echo "/** Inserire qui eventuali funzioni che si desidera utilizzare nell'ambiente **/" > $(echo "$INSPATH")"setup.js"




#Modificare index.html
chmod +x modify_original_html.sh
./modify_original_html.sh "$INSPATH"

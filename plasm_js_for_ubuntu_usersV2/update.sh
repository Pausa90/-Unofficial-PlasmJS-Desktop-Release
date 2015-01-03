#! /bin/bash
#Autore: Andrea Iuliano
#Versione 2.0 

#Scegliere un path per l'installazione
echo "Dove è stato installato plasm.js? Inserire il path (es:/home/nomeUtente/plasm.js/)"
read INSPATH

DIRMADE="false"
while [ "$DIRMADE" = "false" ]; do

	#Controllo se non è vuoto
	while [ "$INSPATH" = "" ]; do
		echo "il path immasso è vuoto, inserire un path valido (es: /home/nomeUtente/plasm.js/    oppure ~/plasm.js/ ) "
		read INSPATH
	done

	#Controllo se è valido, ossia termina con /
	CHECKSLASH=$(echo $INSPATH | awk '/^\/.*[^\/]$/ {print $1}')
	if test ! "$CHECKSLASH" = ""; then
		INSPATH=$(echo $CHECKSLASH)"/"
	fi

	#gestire ~
	TILDE=$(echo $INSPATH | grep '^~')
	if test ! "$TILDE" = ""; then
		TMPPATH=$(pwd | awk -v FS="/" '{print "/"$2"/"$3}')
		INSPATH=$(echo $INSPATH | sed "s@~@$TMPPATH@g")
	else
		ISINHOME=$(echo $INSPATH | grep '^/home/')
		if test "$ISINHOME" = ""; then
			echo "Con questo script non puoi installare in directory con privilegi di superutente"
			echo "Specificare un percorso differente"
			read INSPATH
		else

			#Controllo se esiste il percorso
			if test ! -d $INSPATH; then
				echo "Non è stata trovata alcuna cartella"
				echo "Specificare un nome differente"
				read INSPATH
			else
					DIRMADE="true"
			fi
		fi
	fi
done
	
#Avvio lo script che si occupa della modifica dell'html
chmod +x modify_original_html.sh
./modify_original_html.sh $INSPATH

#Ricreo lo script executePlasmJS
EXEPATH=$(echo "$INSPATH")"executePlasmJS.sh"
rm "$EXEPATH"

echo '#!/bin/bash' > executePlasmJS.sh
echo '#Author: Andrea Iuliano' >> executePlasmJS.sh
echo >> executePlasmJS.sh
echo '#Leggo il file passato in input' >> executePlasmJS.sh
echo 'FILE="$@"' >> executePlasmJS.sh
echo >> executePlasmJS.sh
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
echo '	google-chrome $(echo $INSPATH)plasm.js/index.html' >> executePlasmJS.sh
echo 'fi' >> executePlasmJS.sh

chmod +x executePlasmJS.sh
mv executePlasmJS.sh "$INSPATH" 

echo "Update completato"
echo "Adesso potrai richiamare tutte le variabili/funzioni definite nel codice nella console di google-chrome"
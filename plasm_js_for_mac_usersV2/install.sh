#! /bin/bash
#Autore: Andrea Iuliano
#Versione 1.0 


#Scegliere un path per l'installazione
echo "Dove si vuole installare plasm.js? Inserire il path (es:/home/nomeUtente/plasm.js/)"
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
		ISINHOME=$(echo $INSPATH | grep '^/Users/')
		if test "$ISINHOME" = ""; then
			echo "Con questo script non puoi installare in directory con privilegi di superutente"
            echo "Specificare un percorso differente"
			read INSPATH
        else

            #Controllo se esiste il percorso
            if test -e $INSPATH; then
                if test ! -d $INSPATH; then
                    echo "Questo nome è già in uso per un file"
					echo "Specificare un nome differente"
					read INSPATH
                else
					DIRMADE="true"
                fi
            else
                mkdir $INSPATH
                DIRMADE="true"
            fi
        fi
    fi
done
		
#Avvio lo script che si occupa dell'installazione di plasm
sh install_plasm_js.sh $INSPATH
	
echo "Installazione completata"
echo "Ora è possibile utizzare lo script executePlasmJS.sh per avviare direttamente l'ambiente'"

#Personalizzare sublimeText
echo "Si desidera creare un build system personalizzato su Sublime Text 2? [s/n]"
read ANSW
if [ "$ANSW" = "s" ] || [ "$ANSW" = "S" ]; then
	sh personalize_sublime_text_2.sh $INSPATH
fi

echo "Installazione terminata"

fi

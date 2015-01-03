#! /bin/bash
#Autore: Andrea Iuliano
#Versione 1.0 

INSPATH=$1

INDEX=$(echo $INSPATH)"plasm.js/index.html"
NEWFILE=$(echo $INSPATH)"plasm.js/newindex.html"

NUMROWS=$(wc -l $INDEX | awk '{print $1}')
I=1

touch $NEWFILE


TODELETE="false"

echo "Configurazione dell'ambiente in corso"


#Per ogni riga
while [ $I -le $NUMROWS ]; do

	ROW=$(sed -n "${I}p" $INDEX)

	ISENDBODY=$(echo $ROW | grep '</body>')	
	ISTOMODIFY=$(echo $ROW | grep 'fun.PLASM(p);')
	ISINSTALLED=$(echo $ROW | grep '<!-- edit -->')

	PERC=$(expr $I \* 100 / $NUMROWS)


	if [ "$ISENDBODY" = "" ] && [ "$ISTOMODIFY" = "" ] && [ "$ISINSTALLED" = "" ]; then
		if [ "$TODELETE" = "false" ]; then
			echo $ROW >> $NEWFILE
		fi
	elif test ! "$ISENDBODY" = ""; then
		echo "<!-- edit -->" >> $NEWFILE
		echo '<script type="text/javascript" src="../setup.js"></script>' >> $NEWFILE
		echo >> $NEWFILE
		echo '<script type="text/javascript">' >> $NEWFILE
		echo '	function loadScript(){' >> $NEWFILE
		echo '		var head = document.getElementsByTagName("head")[0];' >> $NEWFILE
		echo '		var script = document.createElement("script");' >> $NEWFILE
		echo '		script.type = "text/javascript";' >> $NEWFILE
		echo '		script.src = "../inputScript.js"' >> $NEWFILE
		echo '		// fire the loading' >> $NEWFILE
		echo '		head.appendChild(script);' >> $NEWFILE
		echo '	}' >> $NEWFILE
		echo >> $NEWFILE
		echo '</script>' >> $NEWFILE
		echo  >> $NEWFILE
		echo '</body>' >> $NEWFILE
		TODELETE="false"
	elif test ! "$ISINSTALLED" = ""; then
		TODELETE="true"		
	else
		echo $ROW >> $NEWFILE
		echo "//Caricamento file inputScript.js" >> $NEWFILE
		echo "loadScript();" >> $NEWFILE
	fi

	#Disegno la barra di caricamento
	NARROW=$(expr $PERC / 2)
	OUT="["
	for (( i=1; i <= "$NARROW"; i++ )); do
		OUT=$(echo $OUT)"="
	done
	
	OUT=$(echo $OUT)">"
	NPOINT=$(expr 50 - $PERC / 2)
	for (( i=1; i <= "$NPOINT"; i++ )); do
		OUT=$(echo $OUT)"."
	done

	echo -ne "$OUT] ($PERC%)\r"

	let I+=1
done


rm $INDEX

mv $NEWFILE $INDEX

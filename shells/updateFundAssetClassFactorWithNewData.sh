#!/bin/bash
cd "$(dirname "${BASH_SOURCE[0]}")"&&cd ..;

if [ $from == ""]
then
    from_value=$(date "+%Y-%m-%d") #shell, can not has spacing. also okay with "".
else
    from_value=$from # call variable with $
fi

if [ $startIndex == ""]
then
    startIndex=0
else
    startIndex=$startIndex
fi

http_proxy="http://120.76.129.106:8111" node --max-old-space-size=400 app/setup.js --updater=updateFromCSRC --CSRCdata=quarterlyData --from=$from_value --startIndex=$startIndex #here must be string after running in shell.

#!/bin/bash
cd "$(dirname "${BASH_SOURCE[0]}")"&&cd ..;

if [ $from == ""]
then
    from_value=$(date "+%Y-%m-%d" -d "3 days ago") #shell, can not has spacing. also okay with "".
else
    from_value=$from # call variable with $
fi

node --max-old-space-size=400 app/setup.js --updater=updateDividend --from=$from_value #here must be string after running in shell.

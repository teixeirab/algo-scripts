#!/bin/bash
cd "$(dirname "${BASH_SOURCE[0]}")"&&cd ..;

if [ $from == ""]
then
    from_value=$(date "+%Y-%m-%d" -d "3 days ago")
else
    from_value=$from
fi

node --max-old-space-size=400 app/setup.js --updater=updateIndexes --from=$from_value

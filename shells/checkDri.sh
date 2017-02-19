#!/bin/bash
cd "$(dirname "${BASH_SOURCE[0]}")"&&cd ..;

if [ $from == ""]
then
    from_value=$(date "+%Y-%m-%d" -d "10 days ago")
else
    from_value=$from
fi

if [ $to == ""]
then
    to_value=$(date "+%Y-%m-%d")
else
    to_value=$to
fi

node --max-old-space-size=400 app/setup.js --calculator=checkDri --from=$from_value --to=$to_value --filePath=${WORKSPACE}

#!/bin/bash
cd "$(dirname "${BASH_SOURCE[0]}")"&&cd ..;

if [ $from == ""]
then
    from_value=$(date "+%Y-%m-%d" -d "10 days ago")
else
    from_value=$from
fi

node --max-old-space-size=400 app/setup.js --updater=updateFundNewIssues --from=$from_value --filePath=${WORKSPACE}

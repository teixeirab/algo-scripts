#!/bin/bash
cd "$(dirname "${BASH_SOURCE[0]}")"&&cd ..;

if [ $from == ""]
then
    from_value=$(date "+%Y-%m-%d")
else
    from_value=$from
fi

if [ $to == ""]
then
    to_value=$(date "+%Y-%m-%d")
else
    to_value=$to
fi

http_proxy="http://120.76.129.106:8111" node --max-old-space-size=400 app/setup.js --calculator=calculateFundAssetClassFactor --from=$from_value --to=$to_value

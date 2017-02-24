#!/bin/bash
cd "$(dirname "${BASH_SOURCE[0]}")"&&cd ..;

if [$from == ""]
then
  from=$(date "+%Y-%m-%d")
else
  from=$from
fi

node app -t $table -p $dir -f $from

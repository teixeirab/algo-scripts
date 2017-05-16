#!/bin/bash
cd "$(dirname "${BASH_SOURCE[0]}")";

if [ $from == ""]
then
  from=$(date "+%Y-%m-%d")
fi

if [ $to == ""]
then
  to=$(date "+%Y-%m-%d")
fi

if [ -z "$dir" ]
then
  dir="/"
fi

node app -t $table -p $dir --from $from --to $to -v

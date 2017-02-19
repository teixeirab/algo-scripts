#!/bin/bash
cd "$(dirname "${BASH_SOURCE[0]}")"&&cd ..;

if [ $EFdate == ""]
then
    efdate=$(date "+%Y-%m-%d") #shell, can not has spacing. also okay with "".
else
    efdate=$EFdate # call variable with $
fi

if [ $AFdate == ""]
then
    afdate=$(date "+%Y-%m-%d") #shell, can not has spacing. also okay with "".
else
    afdate=$AFdate # call variable with $
fi

node --max-old-space-size=400 app/setup.js --calculator=calcEFFundFactor --EFdate=$efdate --AFdate=$afdate

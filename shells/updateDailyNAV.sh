#!/bin/bash
cd "$(dirname "${BASH_SOURCE[0]}")"&&cd ..;
node --max-old-space-size=400 app/setup.js --updater=updateDailyNAV
# gulp run --updater=updateNAVFromEM --mode=prod | tee shells/logs/updateNAVFromEM.prod.log

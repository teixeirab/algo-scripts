#!/bin/bash
cd "$(dirname "${BASH_SOURCE[0]}")"&&cd ..;
node --max-old-space-size=400 app/setup.js --updater=updateFundRank
# gulp run --updater=updateFundRank --mode=prod | tee shells/logs/fund-rank.prod.log

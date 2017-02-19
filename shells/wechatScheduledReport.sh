#!/bin/bash
cd "$(dirname "${BASH_SOURCE[0]}")"&&cd ..;
node --max-old-space-size=400 app/setup.js --calculator=wechat-scheduled-notify
#gulp run --calculator=portfolio-risklevel-stats --mode=prod > shells/logs/portfolio-risklevel-stats.prod.log

#!/bin/bash
cd "$(dirname "${BASH_SOURCE[0]}")"&&cd ..;
node --max-old-space-size=400 app/setup.js --calculator=fund-category-mri
# gulp run --calculator=fund-category-mri --mode=prod | tee shells/logs/fund-category-mri.prod.log

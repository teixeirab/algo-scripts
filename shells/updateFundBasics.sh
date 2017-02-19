#!/bin/bash
cd "$(dirname "${BASH_SOURCE[0]}")"&&cd ..;
node --max-old-space-size=400 app/setup.js --updater=updateFundBasics --filePath=${WORKSPACE}/fund_new_category.csv

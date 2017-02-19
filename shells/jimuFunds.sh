#!/bin/bash
cd "$(dirname "${BASH_SOURCE[0]}")"&&cd ..;
node --max-old-space-size=400 app/setup.js --jimu=update-jimu-funds

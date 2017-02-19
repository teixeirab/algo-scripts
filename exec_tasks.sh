#!/bin/bash
bash -ex /usr/src/app/shells/$1.sh

if ! [ $? -eq 0 ]; then
  curl -i -X POST -d 'payload={"text": "jenkins build failed: '"$BUILD_URL"' @channel"}' http://topsolver.biz:8065/hooks/tmjtus1puff1ub6sx78dbd1jua
  exit 1;
fi

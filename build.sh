#!/bin/bash
rm -rf tmp
mkdir -p tmp/fundpie-backend-engine/src
mkdir -p tmp/fundpie-backend-models/src
mkdir -p tmp/fundpie-backend-services/src
cp -r ../fundpie-backend-engine/src tmp/fundpie-backend-engine/
cp -r ../fundpie-backend-models/src tmp/fundpie-backend-models/
cp -r ../fundpie-backend-services/src tmp/fundpie-backend-services/

docker build --build-arg http_proxy="http://192.168.31.191:1087" -t registry.cn-hangzhou.aliyuncs.com/fundpie/data-updater:$1 .

if [ "$2" = "-push" ]; then
    docker push registry.cn-hangzhou.aliyuncs.com/fundpie/data-updater:$1
fi

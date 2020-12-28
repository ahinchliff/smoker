#!/bin/bash
cd /home/pi/projects/smoker
git fetch
HEADHASH=$(git rev-parse HEAD)
UPSTREAMHASH=$(git rev-parse main@{upstream})

if [ "$HEADHASH" != "$UPSTREAMHASH" ]
then
        echo updates available
        git pull
        cd ./device
        yarn
        yarn build
        cd ..
else
        echo device up to date
fi

NODE_ENV=production PASSWORD=potatosalad node ./device/lib/src/index.js
#!/bin/sh

if [ ! -d "build" ]; then
  yarn dev
fi

node ./build/dev-evaluate.js "$@"
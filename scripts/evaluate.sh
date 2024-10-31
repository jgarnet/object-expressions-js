#!/bin/sh

if [ ! -d "build" ]; then
  yarn dev
fi

node ./build/_evaluate.js "$@"
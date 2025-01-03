#!/bin/sh

# build dist folder with current changes
yarn build || exit 1
# calculate current semver and create release tag
./node_modules/.bin/standard-version || exit 1
# push to remote repo
git push && git push --tag || exit 1
# publish package to npm
npm publish
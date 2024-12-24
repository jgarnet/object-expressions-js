#!/bin/sh

yarn build
version=$(node -p "require('./package.json').version")
git tag -a "v${version}" -m "v${version}" || exit 1
git push --tag || exit 1
npm publish
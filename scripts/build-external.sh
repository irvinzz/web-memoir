#!/usr/bin/env bash

set -euo pipefail

cd external/irvinzz/site-dump
npm i
NODE_ENV=production npm run bundle
cd ../../..
cp external/irvinzz/site-dump/dist/app.js resources/proxy.bundle.js

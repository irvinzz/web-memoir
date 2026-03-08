#!/usr/bin/env bash

set -euo pipefail

# echo $PWD
# echo 1
npm install --prefix=./resources --no-save --omit=dev crawlee playwright @playwright/browser-chromium
# linux
export XDG_CACHE_HOME=./resources/playwright-cache
# win32
export LOCALAPPDATA=./resource/playwright-cache
# darwin
# set HOME ? to trich homedir()
npx --prefix=./resources playwright install chromium

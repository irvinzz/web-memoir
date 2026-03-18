#!/usr/bin/env bash

set -euo pipefail

# linux
export XDG_CACHE_HOME=./resources/playwright-cache
# win32
export LOCALAPPDATA=./resources/playwright-cache
# darwin
# set HOME ? to trich homedir()
npx playwright install chromium

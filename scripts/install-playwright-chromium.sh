#!/usr/bin/env bash

set -euo pipefail

# linux
export XDG_CACHE_HOME=./resources/playwright-cache
# win32
export LOCALAPPDATA=./resources/playwright-cache
# darwin — Playwright uses ~/Library/Caches, override via PLAYWRIGHT_BROWSERS_PATH
export PLAYWRIGHT_BROWSERS_PATH=./resources/playwright-cache
npx playwright install chromium

#!/usr/bin/env bash

set -euo pipefail

bash ./scripts/install-playwright-chromium.sh
node ./scripts/install-mongodb.js


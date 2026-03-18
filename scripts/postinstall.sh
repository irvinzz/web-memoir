#!/usr/bin/env bash

set -euo pipefail

node ./scripts/install-mongodb-tools.js
bash ./scripts/install-playwright-chromium.sh
node ./scripts/install-mongodb.js


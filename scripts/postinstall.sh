#!/usr/bin/env bash

set -euo pipefail

node ./scripts/install-mongodb-tools.js
node ./scripts/install-playwright-chromium.js
node ./scripts/install-mongodb.js


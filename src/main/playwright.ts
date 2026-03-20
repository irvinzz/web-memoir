/* eslint-disable @typescript-eslint/no-require-imports */
import { join } from 'path';

import type crawleePkg from 'crawlee';
import type playWrightPkg from 'playwright';

import { resourcesDir } from './const';

process.env['PLAYWRIGHT_BROWSERS_PATH'] = join(resourcesDir, 'playwright-cache', 'ms-playwright');

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function importCrawlee() {
  const { PlaywrightCrawler, RequestQueue } = require('crawlee') as typeof crawleePkg;
  return {
    PlaywrightCrawler,
    RequestQueue,
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function importPlaywright() {
  const { chromium } = require('playwright') as typeof playWrightPkg;
  return {
    chromium,
  };
}

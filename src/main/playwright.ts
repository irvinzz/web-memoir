import { join } from 'path';

import { resourcesDir } from './const';
import type crawleePkg from '../../resources/node_modules/crawlee';
import type playWrightPkg from '../../resources/node_modules/playwright';

process.env['PLAYWRIGHT_BROWSERS_PATH'] = join(
  resourcesDir,
  'playwright-cache',
  'ms-playwright',
);

export function importCrawlee() {
  const { PlaywrightCrawler, RequestQueue } = (require(join(resourcesDir, 'node_modules', 'crawlee'))) as typeof crawleePkg;

  return {
    PlaywrightCrawler,
    RequestQueue,
  };
}

export function importPlaywright() {
  const { chromium } = (require(join(resourcesDir, 'node_modules', 'playwright'))) as typeof playWrightPkg;
  return {
    chromium,
  };
}


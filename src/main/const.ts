import { join } from 'node:path';

import { app } from 'electron';

export const resourcesDir = (
  app.isPackaged
) ? join(
  app.getAppPath() + '.unpacked',
  'resources',
) : join(
  app.getAppPath(),
  'resources',
);

export const CERT_NAME = 'SD';
import { join } from 'node:path';

import { app } from 'electron';

export const resourcesDir = join(
  app.getAppPath(),
  'resources',
);

export const CERT_NAME = 'SD';
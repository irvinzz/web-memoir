import { mkdir } from 'node:fs/promises';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';

import { app } from 'electron';

export async function runInTmpFolder<T>(cb: (tmpDir: string) => Promise<T>): Promise<T> {
  const tmpDir = join(app.getPath('temp'), crypto.randomUUID());
  await mkdir(tmpDir, { recursive: true });
  try {
    return await cb(tmpDir);
  } finally {
    await rm(tmpDir, { recursive: true });
  }
}

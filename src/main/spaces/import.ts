import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { BrowserWindow, dialog } from 'electron';

import { extract as extractTar } from 'tar';

import { transformSpaceNameToDBName } from '@shared';

import { getDBInstance } from '../db';
import { resourcesDir } from '../const';
import { spawnAsync } from '../process';
import { runInTmpFolder } from '../util';
import { SpaceManifest } from './interfaces';
import { addSpace, removeSpace } from './spaces';

export async function importSpace(mainWindow: BrowserWindow): Promise<void> {
  const dbInfo = await getDBInstance();
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      {
        name: 'App archive',
        extensions: ['wmb.tar.gz'],
      },
    ],
  });
  const firstSelection = result.filePaths[0];
  if (!firstSelection) {
    return;
  }
  if (!firstSelection.endsWith('.wmb.tar.gz')) {
    throw new Error(`Invalid selection '${firstSelection}'`);
  }
  await runInTmpFolder(async (tmpDir) => {
    await extractTar({
      file: firstSelection,
      cwd: tmpDir,
    });
    const spaceManifest = JSON.parse(
      await readFile(join(tmpDir, 'space.json'), 'utf-8')
    ) as SpaceManifest;

    await addSpace(spaceManifest.name, {
      settings: {
        private: true,
        offline: true,
        startPage: spaceManifest.startPage,
      },
    });

    const filesList = await readdir(tmpDir);
    if (filesList.includes(transformSpaceNameToDBName(spaceManifest.name))) {
      try {
        await spawnAsync(
          join(resourcesDir, 'mongodb-tools', 'bin', 'mongorestore'),
          [
            '--port',
            String(dbInfo?.port),
            '--db',
            transformSpaceNameToDBName('import-test'),
            join(tmpDir, transformSpaceNameToDBName(spaceManifest.name)),
          ],
          'mongorestore'
        );
      } catch (e) {
        await removeSpace(spaceManifest.name);

        throw e;
      }
    }
  });
}

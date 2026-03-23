import { cp, readdir, readFile } from 'node:fs/promises';
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
import { getChromeProfilePath } from '../browser';

export async function importSpace(mainWindow: BrowserWindow): Promise<void> {
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
  const dbInfo = await getDBInstance();
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
    try {
      /*
      if (filesList.includes('chrome-profile')) {
        const chromeProfilePath = getChromeProfilePath(spaceManifest.name);
        await cp(join(tmpDir, 'chrome-profile'), chromeProfilePath, { recursive: true });
      }
      */
      if (filesList.includes(transformSpaceNameToDBName(spaceManifest.name))) {
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
      }
    } catch (e) {
      await removeSpace(spaceManifest.name);

      throw e;
    }
  });
}

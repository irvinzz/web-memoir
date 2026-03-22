import { join } from 'node:path';
import { cp, readdir, writeFile } from 'node:fs/promises';

import { BrowserWindow, dialog } from 'electron';
import { create as createTar } from 'tar';

import { transformSpaceNameToDBName } from '@shared';

import { getDBInstance } from '../db';
import { runInTmpFolder } from '../util';
import { spawnAsync } from '../process';
import { resourcesDir } from '../const';
import { SpaceManifest } from './interfaces';
import { loadSpace } from './settings';
import { getChromeProfilePath } from '../browser';

export async function exportSpace(mainWindow: BrowserWindow, spaceName: string): Promise<void> {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select folder',
    properties: ['openDirectory'],
  });
  const destinationFolder = result.filePaths[0];
  if (!destinationFolder) return;
  const dbInfo = await getDBInstance();
  const spaceSettings = (await loadSpace(spaceName)).settings;
  await runInTmpFolder(async (dumpTmpPath) => {
    const chromeProfilePath = getChromeProfilePath(spaceName);
    await cp(chromeProfilePath, join(dumpTmpPath, 'chrome-profile'), { recursive: true });
    await spawnAsync(
      join(resourcesDir, 'mongodb-tools', 'bin', 'mongodump'),
      [
        '--port',
        String(dbInfo?.port),
        '--db',
        transformSpaceNameToDBName(spaceName),
        '-o',
        dumpTmpPath,
      ],
      'mongodump'
    );
    const manifest: SpaceManifest = {
      name: spaceName,
      timeStamp: new Date().toISOString(),
      startPage: spaceSettings?.startPage,
    };
    await writeFile(join(dumpTmpPath, 'space.json'), JSON.stringify(manifest, null, 2));
    const files = await readdir(dumpTmpPath);
    const now = new Date();
    const timeStamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    await createTar(
      {
        file: join(destinationFolder, `${spaceName}.${timeStamp}.wmb.tar.gz`),
        portable: true,
        cwd: dumpTmpPath,
        gzip: {
          level: 9,
        },
      },
      files
    );
  });
}

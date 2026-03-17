import { access, constants, readdir, readFile, rm, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { app, BrowserWindow, dialog } from 'electron';

import { create as createTar, extract as extractTar } from 'tar';

import { transformSpaceNameToDBName } from '@shared';

import { Space, SpacesSettings } from '../shared/Api';
import { getDBInstance } from './db';
import { resourcesDir } from './const';
import { spawnAsync } from './process';

const settingsFilePath = join(app.getPath('userData'), `spaces.json`);

export async function getSpacesSettings(): Promise<SpacesSettings> {
  try {
    await access(settingsFilePath, constants.F_OK);
    const content = await readFile(settingsFilePath, 'utf-8');
    const parsed = JSON.parse(content);
    return parsed as SpacesSettings;
  } catch {
    return {
      activeSpaceName: 'default',
      spaces: [
        {
          name: 'default',
          private: false,
        },
      ],
    };
  }
}

async function writeSpacesSettings(spaces: SpacesSettings): Promise<void> {
  await writeFile(settingsFilePath, JSON.stringify(spaces, null, 2), 'utf-8');
}

export async function addSpace(newSpace: Space): Promise<void> {
  const spacesSettings = await getSpacesSettings();
  if (spacesSettings.spaces.some((space) => space.name === newSpace.name)) {
    throw new Error(`Space with name '${newSpace.name}' already exists`);
  }
  spacesSettings.spaces.push(newSpace);
  await writeSpacesSettings(spacesSettings);
}

export async function removeSpace(spaceToRemoveArg: Space): Promise<void> {
  const spacesSettings = await getSpacesSettings();
  const spaceToRemove = spacesSettings.spaces.find((space) => space.name === spaceToRemoveArg.name);
  if (!spaceToRemove) {
    throw new Error(`Space with name '${spaceToRemoveArg.name}' not found`);
  }
  spacesSettings.spaces = spacesSettings.spaces.filter((space) => space !== spaceToRemove);
  await writeSpacesSettings(spacesSettings);
}

export async function setActiveSpace(spaceToSelectArg: Space): Promise<void> {
  const spacesSettings = await getSpacesSettings();
  const spaceToSelect = spacesSettings.spaces.find((space) => space.name === spaceToSelectArg.name);
  if (!spaceToSelect) {
    throw new Error(`Space with name '${spaceToSelectArg.name}' not found`);
  }
  spacesSettings.activeSpaceName = spaceToSelectArg.name;
  await writeSpacesSettings(spacesSettings);
}

export async function exportSpace(mainWindow: BrowserWindow, spaceName: string): Promise<void> {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select folder',
    properties: ['openDirectory'],
  });
  const destinationFolder = result.filePaths[0];
  if (!destinationFolder) return;
  const dbInfo = await getDBInstance();
  await runInTmpFolder(async (dumpTmpPath) => {
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
    await writeFile(
      join(dumpTmpPath, 'space.json'),
      JSON.stringify(
        {
          name: spaceName,
          timeStamp: new Date().toISOString(),
        },
        null,
        2
      )
    );
    const files = await readdir(dumpTmpPath);
    const now = new Date();
    const timeStamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDay().toString().padStart(2, '0')}`;
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
  if (!firstSelection || !firstSelection.endsWith('.wmb.tar.gz')) {
    throw new Error(`Invalid selection '${firstSelection}'`);
  }
  await runInTmpFolder(async (tmpDir) => {
    await extractTar({
      file: firstSelection,
      cwd: tmpDir,
    });
    const spaceManifest = JSON.parse(await readFile(join(tmpDir, 'space.json'), 'utf-8'));

    await addSpace({
      name: spaceManifest.name,
      private: true,
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
        await removeSpace({
          name: spaceManifest.name,
          private: true,
        });

        throw e;
      }
    }
  });
}

async function runInTmpFolder<T>(cb: (tmpDir: string) => Promise<T>): Promise<T> {
  const tmpDir = join(app.getPath('temp'), crypto.randomUUID());
  await mkdir(tmpDir, { recursive: true });
  try {
    return await cb(tmpDir);
  } finally {
    await rm(tmpDir, { recursive: true });
  }
}

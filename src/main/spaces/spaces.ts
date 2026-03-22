import { access, constants, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { app } from 'electron';

import { Space, SpacesConfiguration } from '../../shared/Api';
import { getSpaceDB } from '../db';
import { getChromeProfilePath } from '../browser';

const settingsFilePath = join(app.getPath('userData'), `spaces.json`);

export async function getSpacesConfiguration(): Promise<SpacesConfiguration> {
  try {
    await access(settingsFilePath, constants.F_OK);
    const content = await readFile(settingsFilePath, 'utf-8');
    const parsed = JSON.parse(content);
    return parsed as SpacesConfiguration;
  } catch {
    return {
      activeSpaceName: 'default',
      spaces: {
        default: {
          settings: {},
        },
      },
    };
  }
}

export async function writeSpacesSettings(spaces: SpacesConfiguration): Promise<void> {
  await writeFile(settingsFilePath, JSON.stringify(spaces, null, 2), 'utf-8');
}

export async function addSpace(spaceName: string, newSpace: Space): Promise<void> {
  const spacesSettings = await getSpacesConfiguration();
  if (spacesSettings.spaces[spaceName]) {
    throw new Error(`Space with name '${spaceName}' already exists`);
  }
  spacesSettings.spaces[spaceName] = newSpace;
  await writeSpacesSettings(spacesSettings);
}

export async function removeSpace(spaceName: string): Promise<void> {
  const spacesSettings = await getSpacesConfiguration();
  const spaceToRemove = spacesSettings.spaces[spaceName];
  if (!spaceToRemove) {
    throw new Error(`Space with name '${spaceName}' not found`);
  }
  const spaceDB = await getSpaceDB(spaceName);
  delete spacesSettings.spaces[spaceName];
  await spaceDB.dropDatabase();
  await rm(getChromeProfilePath(spaceName), { recursive: true });
  await writeSpacesSettings(spacesSettings);
}

export async function setActiveSpace(spaceName: string): Promise<void> {
  const spacesSettings = await getSpacesConfiguration();
  const spaceToSelect = spacesSettings.spaces[spaceName];
  if (!spaceToSelect) {
    throw new Error(`Space with name '${spaceName}' not found`);
  }
  spacesSettings.activeSpaceName = spaceName;
  await writeSpacesSettings(spacesSettings);
}

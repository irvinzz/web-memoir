import { access, constants, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { app } from 'electron';

import { Space, SpacesSettings } from '../shared/Api';

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

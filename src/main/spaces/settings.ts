import { Space, SpaceSettings } from '../../shared/Api';
import { getSpacesConfiguration, writeSpacesSettings } from './spaces';

export async function loadSpace(spaceName: string): Promise<Space> {
  const spacesConfiguration = await getSpacesConfiguration();

  const space = spacesConfiguration.spaces[spaceName];
  if (!space) throw new Error(`Space with name '${spaceName}' missing`);

  return space;
}

export async function writeSpaceSettings(
  spaceName: string,
  newSpaceSettings: SpaceSettings
): Promise<void> {
  const spacesConfiguration = await getSpacesConfiguration();

  const space = spacesConfiguration.spaces[spaceName];
  if (!space) throw new Error(`Space with name '${spaceName}' missing`);

  space.settings = newSpaceSettings;

  await writeSpacesSettings(spacesConfiguration);
}

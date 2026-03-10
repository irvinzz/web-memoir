import { app } from 'electron';
import { ProxySettings } from '../shared/Api';
import { join } from 'path';
import { access, constants, readFile, writeFile } from 'fs/promises';

import { createLogger } from './logger';

const logger = createLogger('settings');

const DEFAULT_PROXY_SETTINGS: ProxySettings = {};

function getProxySettingsFilePath(space: string): string {
  return join(app.getPath('userData'), `settings-${space}.json`);
}

export async function loadProxySettings(spaceName: string): Promise<ProxySettings> {
  const settingsFilePath = getProxySettingsFilePath(spaceName);

  try {
    await access(settingsFilePath, constants.F_OK);
    const content = await readFile(settingsFilePath, 'utf-8');
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object') {
      return parsed as ProxySettings;
    }
    logger.warn('Settings file is empty or malformed – using defaults');
  } catch {
    //
  }
  return DEFAULT_PROXY_SETTINGS;
}

export async function writeProxySettings(
  spaceName: string,
  newProxySettings: ProxySettings
): Promise<void> {
  const settingsFilePath = getProxySettingsFilePath(spaceName);
  const json = JSON.stringify(newProxySettings, null, 2);
  await writeFile(settingsFilePath, json, 'utf-8');
  logger.info('Settings written to disk', spaceName);
}

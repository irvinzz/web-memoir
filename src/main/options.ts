import { app } from 'electron';
import { ProxyOptions } from '../shared/Api';
import { join } from 'path';
import { access, constants, readFile, writeFile } from 'fs/promises';

import { createLogger } from './logger';

const logger = createLogger('options');

const DEFAULT_OPTIONS: ProxyOptions = {};

function getProxyOptionsFilePath(space: string): string {
  return join(app.getPath('userData'), `options-${space}.json`);
}

export async function loadOptions(options: { space: string }): Promise<ProxyOptions> {
  const { space } = options;
  const optionsFilePath = getProxyOptionsFilePath(space);

  try {
    await access(optionsFilePath, constants.F_OK);
    const content = await readFile(optionsFilePath, 'utf-8');
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object') {
      return parsed as ProxyOptions;
    }
    logger.warn('Options file is empty or malformed – using defaults');
  } catch (err) {
    logger.warn('Could not load options file, using defaults', err);
  }
  return DEFAULT_OPTIONS;
}

export async function writeOptions(
  options: {
    space: string;
  },
  newProxyOptions: ProxyOptions
): Promise<void> {
  const { space } = options;
  const optionsFilePath = getProxyOptionsFilePath(space);
  const json = JSON.stringify(newProxyOptions, null, 2);
  await writeFile(optionsFilePath, json, 'utf-8');
  logger.info('Options written to disk', space);
}

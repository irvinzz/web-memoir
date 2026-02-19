import { join } from 'node:path';
import { app, ipcMain } from 'electron';
import { readFile, writeFile, access, constants } from 'node:fs/promises';
import { Options } from '../shared/Api';
import { startDB, stopDB } from './db';
import { startProxy, stopProxy } from './proxy';
import { createLogger } from './logger';

const logger = createLogger('service');

// Paths
const optionsFilePath = join(app.getPath('userData'), 'options.json');

// Default options – adjust according to your API spec
const DEFAULT_OPTIONS: Options = {
  // Example defaults
  // port: 3128,
  // ssl: false,
};

export async function startService(): Promise<void> {
  try {
    await startDB({
      onClose: () => {
        logger.warn('DB closed – stopping proxy');
        stopProxy();
      },
    });
    await startProxy({
      onClose: () => {
        logger.info('Proxy closed');
      },
    });
    logger.info('Service started successfully');
  } catch (err) {
    logger.error('Failed to start service', err);
    throw err;
  }
}

export async function stopService(): Promise<void> {
  try {
    await stopProxy();
    await stopDB();
    logger.info('Service stopped');
    ipcMain.emit('serviceStopped');
  } catch (err) {
    logger.error('Failed to stop service', err);
    ipcMain.emit('serviceStopped');
    throw err;
  }
}

export async function loadOptions(): Promise<Options> {
  try {
    // Check if the file exists first
    await access(optionsFilePath, constants.F_OK);
    const content = await readFile(optionsFilePath, 'utf-8');
    const parsed = JSON.parse(content);
    // Basic validation – ensure the object is not null
    if (parsed && typeof parsed === 'object') {
      return parsed as Options;
    }
    logger.warn('Options file is empty or malformed – using defaults');
  } catch (err) {
    logger.warn('Could not load options file, using defaults', err);
  }
  return DEFAULT_OPTIONS;
}

export async function applyOptions(newOptions: Options): Promise<void> {
  try {
    const json = JSON.stringify(newOptions, null, 2);
    await writeFile(optionsFilePath, json, 'utf-8');
    logger.info('Options written to disk');
    await stopProxy();
    await startProxy({
      onClose: () => {
        logger.info('Proxy restarted with new options');
      },
    });
  } catch (err) {
    logger.error('Failed to apply options', err);
    throw err;
  }
}

app.on('before-quit', async () => {
  await stopService();
});
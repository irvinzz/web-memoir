import { ChildProcess, spawn } from 'node:child_process';
import { join } from 'node:path';

import { app } from 'electron';

import { DBNamePrefix } from '@shared';

import { getCertificateManager } from './cert';
import { caCrtPath } from './cert-ca';
import { importPlaywright } from './playwright';
import { stopProcess } from './process';

export const certManager = getCertificateManager(caCrtPath);

export const profilesBasePath = join(app.getPath('appData'), 'web-memoir', 'chrome-profiles');

export function transformSpaceNameToProfileName(spaceName: string): string {
  return `${DBNamePrefix}${spaceName}`;
}

export function getChromeProfilePath(spaceName: string): string {
  return join(profilesBasePath, transformSpaceNameToProfileName(spaceName));
}

interface ChromiumInstance {
  process: ChildProcess;
}

const chromeInstances: Map<string, ChromiumInstance> = new Map();

export async function startChromium(options: {
  proxyPort: number;
  spaceName: string;
}): Promise<ChildProcess> {
  const { spaceName, proxyPort } = options;
  const chromeInstance = chromeInstances.get(spaceName);
  if (chromeInstance) {
    throw new Error(`Browser for [${spaceName}] is running with PID:${chromeInstance.process.pid}`);
  }
  const { chromium } = importPlaywright();

  const chromiumProcess = spawn(chromium.executablePath(), [
    `--proxy-server=https=localhost:${proxyPort}`,
    `--user-data-dir=${profilesBasePath}`,
    `--profile-directory=${transformSpaceNameToProfileName(spaceName)}`,
    `--disable-infobars`,
    `--no-first-run`,
  ]);

  chromeInstances.set(spaceName, {
    process: chromiumProcess,
  });

  chromiumProcess.on('close', () => {
    chromeInstances.delete(spaceName);
  });

  return chromiumProcess;
}

export async function stopBrowserInstance(profileName: string): Promise<void> {
  const instance = chromeInstances.get(profileName);
  if (instance) {
    await stopProcess(instance.process);
  }
}

export async function installCertificate(): Promise<void> {
  await certManager.installCertificate();
}

export async function uninstallCertificate(): Promise<void> {
  await certManager.uninstallCertificate();
}

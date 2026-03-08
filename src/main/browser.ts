import { ChildProcess, spawn } from 'node:child_process';
import { join } from 'node:path';

import { app } from 'electron';

import { getCertificateManager } from './cert';
import { caCrtPath } from './cert-ca';
import { importPlaywright } from './playwright';
import { stopProcess } from './process';
import { DBNamePrefix } from './spaces';

export const certManager = getCertificateManager(caCrtPath);

const profilesBasePath = join(app.getPath('appData'), 'offline-internet', 'chrome-profiles');

interface ChromiumInstance {
  process: ChildProcess;
}

const chromeInstances: Map<string, ChromiumInstance> = new Map();

export async function startChromium(options: {
  proxyPort: number;
  profileName: string;
}): Promise<ChildProcess> {
  const { profileName, proxyPort } = options;
  const { chromium } = importPlaywright();

  const chromiumProcess = spawn(chromium.executablePath(), [
    `--proxy-server=https=localhost:${proxyPort}`,
    `--user-data-dir=${profilesBasePath}`,
    `--profile-directory=${DBNamePrefix}${profileName}`,
    `--disable-infobars`,
  ]);

  chromeInstances.set(profileName, {
    process: chromiumProcess,
  });

  chromiumProcess.on('close', () => {
    chromeInstances.delete(profileName);
  });

  return chromiumProcess;

  /*
  await openApp(apps.chrome, {
    arguments: [
      `--proxy-server=https=localhost:${proxyPort}`,
      `--profile-directory=oi-${profileName}`,
    ],
    wait: false,
  });
  */
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

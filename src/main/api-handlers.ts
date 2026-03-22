import { app, ipcMain, IpcMainInvokeEvent, shell } from 'electron';

import {
  applySpaceSettings,
  getProxyInstance,
  startProxyInstance,
  stopProxyInstances,
} from './service';
import { Api, IPCResponse, START_BROWSER_CODES } from '../shared/Api';
import { certManager, installCertificate, startChromium } from './browser';
import { caPath } from './cert-ca';
import { resourcesDir } from './const';
import { crawlWebsite } from './web-crawler';
import {
  addSpace,
  exportSpace,
  getSpacesConfiguration,
  importSpace,
  removeSpace,
  setActiveSpace,
} from './spaces';
import { mainWindow } from './index';

type ToHandler<T extends (...args: any[]) => Promise<any>> = (
  _event: IpcMainInvokeEvent,
  ...args: Parameters<T>
) => ReturnType<T>;

function handleApiEvent<K extends keyof Api>(name: K, handler: ToHandler<Api[K]>): void {
  return ipcMain.handle(name, handler);
}

handleApiEvent('applySpaceSettings', async (_event, space, newSettings) => {
  return applySpaceSettings({ space }, newSettings);
});

handleApiEvent('startProxyInstance', async (_event, space) => {
  return startProxyInstance({ space });
});

handleApiEvent('stopProxyInstance', async (_event, space) => {
  await stopProxyInstances({ space });
});

handleApiEvent('runCrawler', async (_event, space, startUrl, options) => {
  const proxyInstance = getProxyInstance(space);
  if (!proxyInstance) throw new Error(`Proxy instance stopped`);
  await crawlWebsite({
    startUrl,
    proxyUrl: `http://localhost:${proxyInstance.port}`,
    headless: options.runInForeground !== true,
    progressCallback(state) {
      //
    },
  });
});

handleApiEvent(
  'startBrowser',
  async (_event, spaceName, ignoreSSLError): Promise<IPCResponse<START_BROWSER_CODES>> => {
    const proxyInstance = getProxyInstance(spaceName);
    if (!proxyInstance) {
      return {
        code: 'PROXY_PROCESS_MISSING',
        message: '',
      };
    }
    if (ignoreSSLError) {
      await startChromium({ proxyPort: proxyInstance.port, spaceName });
      return { code: 'OK', message: '' };
    }

    const certificateCheckResult = await certManager.checkInstalledCertificate();
    console.debug('certificateCheckResult', certificateCheckResult);
    if (certificateCheckResult.code !== 'OK') {
      return {
        message: 'Certificate is not installed or does not match',
        ...certificateCheckResult,
      };
    }

    await startChromium({ proxyPort: proxyInstance.port, spaceName });

    return {
      code: 'OK',
      message: '',
    };
  }
);

handleApiEvent('installCertificate', async () => {
  await installCertificate();
});

handleApiEvent('describeProxyInstance', async (_event, space) => {
  const instance = getProxyInstance(space);
  if (!instance) return null;
  return { port: instance.port, ip: instance.address };
});

handleApiEvent('openCertiticateFolder', async () => {
  shell.openPath(caPath);
});

handleApiEvent('inspect', async () => {
  return {
    resourcesDir,
    getAppPath: app.getAppPath(),
    resourcesPath: process.resourcesPath,
    getPath: {
      assets: app.getPath('assets'),
      userData: app.getPath('userData'),
    },
    env: {
      UPSTREAM_PROXY: process['UPSTREAM_PROXY'],
    },
  };
});

handleApiEvent('getSpaces', async () => {
  return getSpacesConfiguration();
});

handleApiEvent('addSpace', async (_event, spaceName, newSpace) => {
  return addSpace(spaceName, newSpace);
});

handleApiEvent('removeSpace', async (_event, spaceName) => {
  return removeSpace(spaceName);
});

handleApiEvent('setActiveSpace', async (_event, spaceName) => {
  return setActiveSpace(spaceName);
});

handleApiEvent('exportSpace', async (_event, spaceName) => {
  return exportSpace(mainWindow!, spaceName);
});

handleApiEvent('importSpace', async () => {
  return importSpace(mainWindow!);
});

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

handleApiEvent('applySpaceSettings', async (_event, spaceName, newSettings) => {
  return applySpaceSettings({ spaceName }, newSettings);
});

handleApiEvent('startProxyInstance', async (_event, spaceName) => {
  return startProxyInstance({ spaceName: spaceName });
});

handleApiEvent('stopProxyInstance', async (_event, spaceName) => {
  await stopProxyInstances({ spaceName });
});

handleApiEvent('runCrawler', async (_event, spaceName, startUrl, options) => {
  const proxyInstance = getProxyInstance(spaceName);
  if (!proxyInstance) {
    throw new Error(`Proxy instance for space '${spaceName}' is not running`);
  }
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

handleApiEvent('describeProxyInstance', async (_event, spaceName) => {
  const instance = getProxyInstance(spaceName);
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

handleApiEvent('getLocale', async () => {
  const detecetedLocale = app.getLocale();
  return detecetedLocale;
});

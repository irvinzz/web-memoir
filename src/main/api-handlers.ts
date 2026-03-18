import { app, ipcMain, IpcMainInvokeEvent, shell } from 'electron';

import {
  applyProxySettings,
  getProxyInstance,
  startProxyInstance,
  stopProxyInstances,
} from './service';
import { Api, IPCResponse, START_BROWSER_CODES } from '../shared/Api';
import { certManager, installCertificate, startChromium } from './browser';
import { loadProxySettings } from './settings';
import { caPath } from './cert-ca';
import { resourcesDir } from './const';
import { crawlWebsite } from './web-crawler';
import {
  addSpace,
  exportSpace,
  getSpacesSettings,
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

handleApiEvent('loadOptions', async (_event, space) => {
  return loadProxySettings(space);
});

handleApiEvent('applyOptions', async (_event, space, newSettings) => {
  return applyProxySettings({ space }, newSettings);
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
    progressCallback(state) {
      //
    },
  });
});

handleApiEvent(
  'startBrowser',
  async (_event, space, ignoreSSLError): Promise<IPCResponse<START_BROWSER_CODES>> => {
    const proxyInstance = getProxyInstance(space);
    if (!proxyInstance) {
      return {
        code: 'PROXY_PROCESS_MISSING',
        message: '',
      };
    }
    if (ignoreSSLError) {
      await startChromium({ proxyPort: proxyInstance.port, profileName: space });
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

    await startChromium({ proxyPort: proxyInstance.port, profileName: space });

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
  return { port: instance.port };
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
  return getSpacesSettings();
});

handleApiEvent('addSpace', async (_event, newSpace) => {
  return addSpace(newSpace);
});

handleApiEvent('removeSpace', async (_event, space) => {
  return removeSpace(space);
});

handleApiEvent('setActiveSpace', async (_event, space) => {
  return setActiveSpace(space);
});

handleApiEvent('exportSpace', async (_event, spaceName) => {
  return exportSpace(mainWindow!, spaceName);
});

handleApiEvent('importSpace', async () => {
  return importSpace(mainWindow!);
});

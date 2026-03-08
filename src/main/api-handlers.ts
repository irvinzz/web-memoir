import { join } from 'node:path';

import { app, ipcMain, IpcMainInvokeEvent, shell } from 'electron';

import { applyOptions, getProxyInstance, startProxyInstance, stopProxyInstances } from './service';
import { Api, IPCResponse, START_BROWSER_CODES } from '../shared/Api';
import { certManager, installCertificate, startChromium } from './browser';
import { loadOptions } from './options';
import { caPath } from './cert-ca';
import { resourcesDir } from './const';

type ToHandler<T extends (...args: any[]) => Promise<any>> = (
  _event: IpcMainInvokeEvent,
  ...args: Parameters<T>
) => ReturnType<T>;

function handleApiEvent<K extends keyof Api>(
  name: K,
  handler: ToHandler<Api[K]>,
) {
  return ipcMain.handle(
    name,
    handler,
  );
}

handleApiEvent('loadOptions', async (_event, space) => {
  return await loadOptions({ space });
});

handleApiEvent('applyOptions', async (_event, space, newOptions) => {
  await applyOptions({ space }, newOptions);
});

handleApiEvent('startProxyInstance', async (_event, space) => {
  await startProxyInstance({ space });
});

handleApiEvent('stopProxyInstance', async (_event, space) => {
  await stopProxyInstances({ space });
});

/*
handle('runCrawler', (async (_event, space, startUrl, options) => {
  const proxyInstance = getProxyInstance(space);
  await crawlWebsite({
    startUrl,
    progressFile: join(app.getPath('userData'), 'crawl-progress.json'),
    proxyUrl: options.proxy,
    progressCallback(state) {
      //
    },
  });
}) as ToHandler<Api['runCrawler']>)
*/

handleApiEvent('startBrowser', (async (_event, space, ignoreSSLError): Promise<IPCResponse<START_BROWSER_CODES>> => {
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
      ...certificateCheckResult,
      message: "Certificate is not installed or does not match",
    };
  }

  await startChromium({ proxyPort: proxyInstance.port, profileName: space });

  return {
    code: 'OK',
    message: '',
  };
}));

handleApiEvent('installCertificate', async (_event) => {
  await installCertificate();
});

handleApiEvent('describeProxyInstance', async (_event, space) => {
  const instance = getProxyInstance(space);
  return { port: instance!.port };
});

handleApiEvent('openCertiticateFolder', async (_event) => {
  shell.openPath(caPath);
});

handleApiEvent('inspect', (async (_event) => {
  return {
    resourcesDir,
    getAppPath: app.getAppPath(),
    resourcesPath: process.resourcesPath,
    getPath: {
      assets: app.getPath('assets'),
      userData: app.getPath('userData'),
    },
  };
}));

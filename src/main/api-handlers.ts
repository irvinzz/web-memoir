import { ipcMain, IpcMainInvokeEvent } from 'electron';

import { applyOptions, startProxyInstance, stopProxyInstances } from './service';
import { Api } from '../shared/Api';
import { installCertificate, startBrowser } from './browser';
import { loadOptions } from './options';

type ToHandler<T extends (...args: any[]) => Promise<any>> = (
  _event: IpcMainInvokeEvent,
  ...args: Parameters<T>
) => ReturnType<T>;

ipcMain.handle('loadOptions', (async (_event, space) => {
  return await loadOptions({ space });
}) as ToHandler<Api['loadOptions']>);

ipcMain.handle('applyOptions', (async (_event, space, newOptions) => {
  await applyOptions({ space }, newOptions);
}) as ToHandler<Api['applyOptions']>);

ipcMain.handle('startProxyInstance', (async (_event, space) => {
  await startProxyInstance({ space });
}) as ToHandler<Api['startProxyInstance']>);

ipcMain.handle('stopProxyInstance', (async (_event, space) => {
  await stopProxyInstances({ space });
}) as ToHandler<Api['stopProxyInstance']>);

/*
ipcMain.handle('runCrawler', (async (_event, space, startUrl, options) => {
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

ipcMain.handle('startBrowser', (async (_event, space, ignoreSSLError) => {
  return await startBrowser(space, ignoreSSLError);
}) as ToHandler<Api['startBrowser']>);

ipcMain.handle('installCertificate', (async (_event) => {
  await installCertificate();
}) as ToHandler<Api['installCertificate']>);

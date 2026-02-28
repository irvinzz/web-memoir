import { clipboard, contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

import { Api, ProxyOptions } from '../shared/Api';

// Custom APIs for renderer
const api: Api = {
  loadOptions: (space) => ipcRenderer.invoke('loadOptions', space),
  applyOptions: (space, newOptions: ProxyOptions) => ipcRenderer.invoke('applyOptions', space, newOptions),
  startProxyInstance: (space) => ipcRenderer.invoke('startProxyInstance', space),
  stopProxyInstance: (space) => ipcRenderer.invoke('stopProxyInstance', space),
  describeProxyInstance: (space) => ipcRenderer.invoke('describeProxyInstance', space),
  startBrowser: (space, ignoreSSLError) => ipcRenderer.invoke('startBrowser', space, ignoreSSLError),
  installCertificate: () => ipcRenderer.invoke('installCertificate'),
  openCertiticateFolder: () => ipcRenderer.invoke('openCertiticateFolder'),
  runCrawler: (space, startUrl, options) => ipcRenderer.invoke('runCrawler', space, startUrl, options),
  putToClipboard: async (input) => clipboard.writeText(input),
  inspect: () => ipcRenderer.invoke('inspect'),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
console.debug('process.contextIsolated', process.contextIsolated);
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

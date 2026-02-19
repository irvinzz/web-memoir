import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

import { Api, Options } from '../shared/Api';

// Custom APIs for renderer
const api: Api = {
  loadOptions: () => ipcRenderer.invoke('loadOptions'),
  applyOptions: (newOptions: Options) => ipcRenderer.invoke('applyOptions', newOptions),
  startService: () => ipcRenderer.invoke('startService'),
  stopService: () => ipcRenderer.invoke('stopService'),
  startBrowser: (ignoreSSLError) => ipcRenderer.invoke('startBrowser', ignoreSSLError),
  installCertificate: () => ipcRenderer.invoke('installCertificate'),
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

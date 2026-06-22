import { MainEventsMap } from '@shared';

import { mainWindow } from './window';

export function sendEventToRenderer<K extends keyof MainEventsMap>(
  name: K,
  payload: MainEventsMap[K]
): void {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send(name, payload);
}

import { join } from 'node:path';
import { app, BrowserWindow, Tray, Menu } from 'electron';
import { electronApp, optimizer } from '@electron-toolkit/utils';

import { createWindow, mainWindow } from './window';

import { stopProxyInstances } from './service';
import './api-handlers';
import { resourcesDir } from './const';

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Prevent stop app when main window closed
  mainWindow!.on('close', (e) => {
    e.preventDefault();
    mainWindow!.hide();
  });

  // Close window and Gracefully stop all services then close application
  app.on('before-quit', (event) => {
    event.preventDefault();
    setTimeout(() => {
      stopProxyInstances({
        allSpaces: true,
      }).then(() => {
        console.log('All Proxy instances stopped');
        app.exit();
      });
    }, 1);
  });
});

let tray: Tray | null = null;
app.whenReady().then(() => {
  tray = new Tray(join(resourcesDir, 'icon9.png'));
  tray.setToolTip('Web Memoir');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show main window',
      type: 'normal',
      click: () => {
        mainWindow?.show();
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Quit',
      type: 'normal',
      click: () => {
        mainWindow?.destroy();
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);

  process.on('SIGTERM', async () => {
    await stopProxyInstances({ allSpaces: true });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

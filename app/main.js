// only add update server if it's not being run from cli
// if (require.main !== module) {
//   require('update-electron-app')({
//     logger: require('electron-log')
//   })
// }

const path = require('path');
const url = require('url');
const fs = require('fs');
const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');

// app.commandLine.appendSwitch('ignore-certificate-errors');
const debug = false;
const feedUrl = 'https://haierstore.zjk.taeapp.com/exe/';
let webContents = null;
// if (process.mas) app.setName('Electron APIs')

let mainWindow = null;
let isOnline = false;

function initialize() {
  const shouldQuit = makeSingleInstance()
  if (shouldQuit) return app.quit()
  function createWindow() {
    const windowOptions = {
      width: 1920,
      // minWidth: 680,
      height: 1080,
      frame: false,
      alwaysOnTop: true,
      fullscreen: true,
      title: app.getName(),
      webviewTag: true,
      webPreferences: {
        webviewTag: true,
        nodeIntegration: true,
        devTools: true
      }
    }


    mainWindow = new BrowserWindow(windowOptions)
    mainWindow.maximize();
    const winUrl = url.format({
      pathname: path.join(__dirname, '/online-status.html'),
      protocol: 'file:',
      slashes: true
    });


    webContents = mainWindow.webContents;
    mainWindow.loadURL(winUrl);
    // Launch fullscreen with DevTools open, usage: npm run debug
    if (debug) {
      mainWindow.webContents.openDevTools()
      mainWindow.maximize()
      // require('devtron').install()
    }
    // webContents.on('did-finish-load', () => {
    //   webContents.setZoomFactor(1);
    //   webContents.setVisualZoomLevelLimits(1, 1);
    //   webContents.setLayoutZoomLevelLimits(0, 0);
    // });
    checkForUpdates();
    mainWindow.on('closed', () => {
      mainWindow = null
    })
  }

  app.on('ready', () => {

    createWindow()
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    }
  })
}


// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance() {
  if (process.mas) return false
  const gotTheLock = app.requestSingleInstanceLock()
  if (gotTheLock) {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // 当运行第二个实例时,将会聚焦到myWindow这个窗口
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    })
  }
  return !gotTheLock;
}
let sendUpdateMessage = (message, data) => {
  webContents.send('message', { message, data });
};
let checkForUpdates = () => {
  autoUpdater.setFeedURL(feedUrl);
  autoUpdater.on('error', function (message) {
    sendUpdateMessage('error', message)
  });
  autoUpdater.on('checking-for-update', function (message) {
    sendUpdateMessage('checking-for-update', message)
  });
  autoUpdater.on('update-available', function (message) {
    sendUpdateMessage('update-available', message)
  });
  autoUpdater.on('update-not-available', function (message) {
    sendUpdateMessage('update-not-available', message)
  });

  // 更新下载进度事件
  autoUpdater.on('download-progress', function (progressObj) {
    sendUpdateMessage('downloadProgress', progressObj)
  })
  autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
    ipcMain.on('updateNow', (e, arg) => {
      //some code here to handle event
      autoUpdater.quitAndInstall();
    })
    sendUpdateMessage('isUpdateNow');
  });

  //执行自动更新检查
  autoUpdater.checkForUpdates();
};
ipcMain.on('close-main-window', (event, arg) => {
  app.quit()
})

//设备是否在线
ipcMain.on('online-status-changed', (event, status) => {
  if (!isOnline && status === 'online') {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '/index.html'),
        protocol: 'file:',
        slashes: true
      })
    );

    // mainWindow.loadURL(path.join(url))
    isOnline = true;
  }
});

initialize();
app.on('window-all-closed', () => app.quit());

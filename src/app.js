const { app, shell, BrowserWindow } = require('electron');
const { promises: fs }              = require('fs');
const path                          = require('path');
const assestPath                    = app.getPath("userData");

require('@electron/remote/main').initialize();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 800,
    icon: path.join(app.getAppPath(), "assets/icon.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  fs.access(path.join(assestPath, 'cert.crt'), (error) => {
    if (!error) {
      fs.access(path.join(assestPath, 'key.key'), (error) => {
        if (!error) {
          fs.access(path.join(assestPath, 'cuit.txt'), (error) => {
            if (!error) {
              mainWindow.loadFile(path.join(__dirname, 'views/generate_invoice.html'));
              return;
            }
          });
        }
      });
    }
    
    mainWindow.loadFile(path.join(__dirname, 'views/configurate.html'));
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

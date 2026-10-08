const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    frame: true, // Set to false if you want to build a custom institutional title bar
    title: "Varban Markets - Institutional Desktop Terminal",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // In development, load the local Next.js dev server
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000/terminal');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the exported static files from the root /out folder
    mainWindow.loadFile(path.join(__dirname, '../out/terminal.html'));
  }

  // Handle external links (Open in user's default browser instead of Electron)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) {
      require('electron').shell.openExternal(url);
    }
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
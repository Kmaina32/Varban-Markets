const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

/**
 * @fileOverview Institutional Native Process Controller.
 * Manages the multi-window lifecycle and secure system-level handshakes.
 */

let mainWindow;
const detachedWindows = new Map();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    backgroundColor: '#FFFFFF',
    title: "Varban Markets - Institutional Desktop Terminal",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true, // Institutional security enforcement
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000/terminal');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../out/terminal.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    // Close all detached windows when main terminal exits
    detachedWindows.forEach(win => win.close());
    detachedWindows.clear();
  });
}

// Multi-Monitor Logic: Detached Chart Spawning
ipcMain.on('command:detach-chart', (event, symbol) => {
  if (detachedWindows.has(symbol)) {
    detachedWindows.get(symbol).focus();
    return;
  }

  const displays = screen.getAllDisplays();
  const externalDisplay = displays.find((display) => display.bounds.x !== 0 || display.bounds.y !== 0);

  let chartWin = new BrowserWindow({
    width: 800,
    height: 600,
    title: `${symbol} - Detached Chart`,
    backgroundColor: '#FFFFFF',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // If external monitor exists, spawn there
  if (externalDisplay) {
    chartWin.setPosition(externalDisplay.bounds.x + 50, externalDisplay.bounds.y + 50);
  }

  const url = isDev 
    ? `http://localhost:3000/terminal?symbol=${symbol}&mode=detached`
    : `file://${path.join(__dirname, '../out/terminal.html')}?symbol=${symbol}&mode=detached`;

  chartWin.loadURL(url);
  detachedWindows.set(symbol, chartWin);

  chartWin.on('closed', () => {
    detachedWindows.delete(symbol);
  });
});

// Biometric Handshake: Preparation for Windows Hello
ipcMain.handle('auth:request-biometric', async () => {
  // In a production build with code signing, this would call Windows Biometric APIs
  // For now, we simulate a successful hardware handshake
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true, node: "WIN-HELLO-PROV-01" }), 800);
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

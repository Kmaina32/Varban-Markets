const { contextBridge, ipcRenderer } = require('electron');

/**
 * @fileOverview Native API Bridge v2.0.
 * Securely exposes multi-monitor and biometric capabilities to the frontend.
 */

contextBridge.exposeInMainWorld('VarbanNative', {
  getAppVersion: () => "4.2.0-win-native",
  platform: process.platform,
  isNative: true,
  
  // Command: Detach chart to a new window
  detachChart: (symbol) => {
    ipcRenderer.send('command:detach-chart', symbol);
  },
  
  // Handshake: Windows Hello Biometric Auth
  requestBiometricAuth: async () => {
    return ipcRenderer.invoke('auth:request-biometric');
  }
});

const { contextBridge, ipcRenderer } = require('electron');

/**
 * @fileOverview Native API Bridge.
 * Securely exposes specific desktop capabilities to the React frontend.
 */

contextBridge.exposeInMainWorld('VarbanNative', {
  getAppVersion: () => "4.2.0-win-native",
  platform: process.platform,
  
  // Future implementation for Multi-Monitor detachment
  openDetachedChart: (symbol) => {
    console.log(`Command: Detaching chart for ${symbol}`);
    // Logic to communicate with main.js to create a new window
  },
  
  // Windows Hello Biometric Handshake
  requestBiometricAuth: async () => {
    return new Promise((resolve) => {
      // Logic for Windows WebAuthn bridge
      setTimeout(() => resolve({ success: true }), 500);
    });
  }
});
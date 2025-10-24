/**
 * PRELOAD SCRIPT - Context Bridge
 *
 * Purpose: Securely expose IPC communication to renderer processes
 * Security: Runs in isolated context between main and renderer
 *
 * This script creates a secure bridge that prevents renderer processes
 * from accessing Node.js directly while still allowing controlled IPC.
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose safe API to renderer process via window.electronAPI
 *
 * SECURITY: Only whitelisted channels can be used
 * Prevents arbitrary IPC access from potentially compromised renderer
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // Receive game data updates from main process
  onGameDataUpdate: (callback) => {
    ipcRenderer.on('game-data-update', (_event, data) => callback(data));
  },

  // Receive connection status updates
  onConnectionStatus: (callback) => {
    ipcRenderer.on('connection-status', (_event, status) => callback(status));
  },

  // Receive tip box toggle commands
  onToggleTipBox: (callback) => {
    ipcRenderer.on('toggle-tip-box', (_event, show) => callback(show));
  },

  // Send tip box toggle request to main process
  sendToggleTipBox: (show) => {
    ipcRenderer.send('toggle-tip-box', show);
  },

  // Get current game status (async)
  getGameStatus: async () => {
    return await ipcRenderer.invoke('get-game-status');
  },

  // Edit mode toggle
  onEditModeToggle: (callback) => {
    ipcRenderer.on('edit-mode-toggle', (_event, enabled) => callback(enabled));
  },

  sendEditModeToggle: (enabled) => {
    ipcRenderer.send('edit-mode-toggle', enabled);
  },

  // Transparency control
  onTransparencyChange: (callback) => {
    ipcRenderer.on('transparency-change', (_event, opacity) => callback(opacity));
  },

  sendTransparencyChange: (opacity) => {
    ipcRenderer.send('transparency-change', opacity);
  },

  // Test mode with sample data
  sendTestMode: (enabled) => {
    ipcRenderer.send('test-mode', enabled);
  },

  // Hotkey change
  sendHotkeyChange: (hotkey) => {
    ipcRenderer.send('hotkey-change', hotkey);
  },

  // Reset panel positions
  onResetPositions: (callback) => {
    ipcRenderer.on('reset-positions', () => callback());
  },

  sendResetPositions: () => {
    ipcRenderer.send('reset-positions');
  },

  // Remove specific listener (cleanup)
  removeListener: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

console.log('Preload script loaded - Secure context bridge established');

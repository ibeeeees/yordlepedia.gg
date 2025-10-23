const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const LCUConnector = require('./lcu-connector');

let mainWindow;
let overlayWindow;
let lcuConnector;
let gameDataInterval;
let overlayManuallyHidden = false; // Track if user manually hid overlay

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    frame: true,
    transparent: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    title: 'Yordlepedia Control Panel',
    icon: path.join(__dirname, 'assets', 'yordlepedia-icon.svg')
  });

  mainWindow.loadFile('control-panel.html');
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  console.log('✅ Control panel window created');
}

async function createOverlayWindow() {
  overlayWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    transparent: true,
    frame: false,
    skipTaskbar: true,
    focusable: false,
    alwaysOnTop: true,
    show: false, // Hidden by default
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  overlayWindow.loadFile('overlay.html');
  overlayWindow.setIgnoreMouseEvents(true);

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  console.log('✅ Overlay window created (hidden until game starts)');
}

// Initialize League Client connection
async function initializeLCU() {
  lcuConnector = new LCUConnector();

  // Try to connect
  const connected = await lcuConnector.connect();

  if (connected) {
    sendConnectionStatus({ connected: true, message: 'Connected to League Client' });

    // Listen for gameflow phase changes
    lcuConnector.on('gameflow-phase', (data) => {
      console.log('Gameflow phase changed:', data);
      handleGameflowChange(data);
    });

    // Start polling for game data
    startGameDataPolling();
  } else {
    sendConnectionStatus({ connected: false, message: 'Waiting for League Client...' });

    // Retry connection every 5 seconds
    setTimeout(() => initializeLCU(), 5000);
  }
}

// Start polling for live game data
function startGameDataPolling() {
  if (gameDataInterval) {
    clearInterval(gameDataInterval);
  }

  gameDataInterval = setInterval(async () => {
    try {
      // Check gameflow phase
      const phase = await lcuConnector.getGameflowPhase();

      if (phase === 'InProgress') {
        // Show overlay if hidden (but only if user didn't manually hide it)
        if (overlayWindow && !overlayWindow.isVisible() && !overlayManuallyHidden) {
          overlayWindow.show();
          console.log('✅ Game detected - overlay shown');
        }

        // Get all game data
        const allGameData = await lcuConnector.getAllGameData();
        const activePlayer = await lcuConnector.getActivePlayerData();

        if (allGameData || activePlayer) {
          sendGameData({
            allGameData,
            activePlayer
          });

          sendConnectionStatus({
            connected: true,
            inGame: true,
            phase: 'InProgress'
          });
        }
      } else {
        // Hide overlay if not in game
        if (overlayWindow && overlayWindow.isVisible()) {
          overlayWindow.hide();
          console.log('⚠️ Not in game - overlay hidden');
        }

        sendConnectionStatus({
          connected: true,
          inGame: false,
          phase: phase
        });
      }
    } catch (error) {
      console.error('Error polling game data:', error.message);
    }
  }, 1000); // Poll every second
}

// Handle gameflow phase changes
function handleGameflowChange(data) {
  const phase = typeof data === 'string' ? data : data.data;

  console.log(`Game phase: ${phase}`);

  if (phase === 'InProgress') {
    console.log('🎮 Game started! Showing overlay and monitoring live data...');
    // Show overlay when game starts (unless user manually hid it)
    if (overlayWindow && !overlayWindow.isVisible() && !overlayManuallyHidden) {
      overlayWindow.show();
      console.log('✅ Overlay now visible');
    }
    startGameDataPolling();
  } else if (phase === 'EndOfGame') {
    console.log('🏁 Game ended - hiding overlay');
    // Hide overlay when game ends and reset manual hide flag
    if (overlayWindow && overlayWindow.isVisible()) {
      overlayWindow.hide();
      console.log('✅ Overlay hidden');
    }
    overlayManuallyHidden = false; // Reset for next game
    if (gameDataInterval) {
      clearInterval(gameDataInterval);
    }
  } else {
    // Hide overlay in lobby/champ select
    if (overlayWindow && overlayWindow.isVisible() && !overlayManuallyHidden) {
      overlayWindow.hide();
      console.log('✅ Overlay hidden (not in game)');
    }
  }
}

// Send connection status to overlay
function sendConnectionStatus(status) {
  if (overlayWindow) {
    overlayWindow.webContents.send('connection-status', status);
  }
}

// Send game data to overlay
function sendGameData(data) {
  if (overlayWindow) {
    overlayWindow.webContents.send('game-data-update', data);
  }
}

// Toggle overlay visibility
function toggleOverlay() {
  if (overlayWindow) {
    if (overlayWindow.isVisible()) {
      overlayWindow.hide();
      overlayManuallyHidden = true;
      console.log('🔲 Overlay hidden by hotkey (Ctrl+Shift+O)');
    } else {
      overlayWindow.show();
      overlayManuallyHidden = false;
      console.log('✅ Overlay shown by hotkey (Ctrl+Shift+O)');
    }
  }
}

app.whenReady().then(async () => {
  createMainWindow();
  await createOverlayWindow();

  // Register global hotkey: Ctrl+Shift+O
  const hotkey = globalShortcut.register('CommandOrControl+Shift+O', () => {
    toggleOverlay();
  });

  if (hotkey) {
    console.log('✅ Hotkey registered: Ctrl+Shift+O to toggle overlay');
  } else {
    console.error('❌ Failed to register hotkey');
  }

  // Initialize LCU connection
  await initializeLCU();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();

  if (lcuConnector) {
    lcuConnector.disconnect();
  }
  if (gameDataInterval) {
    clearInterval(gameDataInterval);
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts before quitting
  globalShortcut.unregisterAll();
});

// IPC handlers
ipcMain.on('toggle-tip-box', (event, show) => {
  if (overlayWindow) {
    overlayWindow.webContents.send('toggle-tip-box', show);
  }
});

ipcMain.handle('get-game-status', async () => {
  if (lcuConnector && lcuConnector.connected) {
    const phase = await lcuConnector.getGameflowPhase();
    return { connected: true, phase };
  }
  return { connected: false };
});

console.log('🚀 Yordlepedia with League Client API starting...');

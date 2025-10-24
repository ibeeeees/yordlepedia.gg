const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const LCUConnector = require('./lcu-connector');
const LiveGameConnector = require('./live-game-connector'); // ✅ NEW: For in-game data
const FullscreenDetector = require('./fullscreen-detector'); // ✅ NEW: Detect fullscreen mode

// Configuration constants
const CONFIG = {
  POLLING_INTERVAL: 1000,        // Game data polling interval (ms)
  RECONNECT_INTERVAL: 5000,      // LCU reconnection interval (ms)
  MAX_RECONNECT_ATTEMPTS: 10,    // Maximum reconnection attempts
  HOTKEY: 'CommandOrControl+Shift+O', // Overlay toggle hotkey
  OVERLAY_WIDTH: 1920,
  OVERLAY_HEIGHT: 1080,
  CONTROL_PANEL_WIDTH: 400,
  CONTROL_PANEL_HEIGHT: 600
};

let mainWindow;
let overlayWindow;
let lcuConnector;              // For League Client (lobby, champ select)
let liveGameConnector;         // ✅ NEW: For in-game data (port 2999)
let fullscreenDetector;        // ✅ NEW: Detect fullscreen compatibility
let gameDataInterval;
let overlayManuallyHidden = false; // Track if user manually hid overlay
let reconnectAttempts = 0;         // Track reconnection attempts
let hasShownFullscreenWarning = false; // Show warning only once

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: CONFIG.CONTROL_PANEL_WIDTH,
    height: CONFIG.CONTROL_PANEL_HEIGHT,
    frame: true,
    transparent: false,
    webPreferences: {
      nodeIntegration: false,      // SECURITY: Disabled Node.js in renderer
      contextIsolation: true,       // SECURITY: Enabled context isolation
      preload: path.join(__dirname, 'preload.js') // Secure IPC bridge
    },
    title: 'Yordlepedia Control Panel',
    icon: path.join(__dirname, 'assets', 'yordlepedia-icon.svg')
  });

  mainWindow.loadFile('control-panel.html');

  //  When control panel closes, quit entire app
  mainWindow.on('closed', () => {
    console.log('Control panel closed - shutting down application...');
    mainWindow = null;

    // Close overlay window
    if (overlayWindow) {
      overlayWindow.close();
      overlayWindow = null;
    }

    // Quit the entire application
    app.quit();
  });

  console.log('Control panel window created');
}

async function createOverlayWindow() {
  overlayWindow = new BrowserWindow({
    width: CONFIG.OVERLAY_WIDTH,
    height: CONFIG.OVERLAY_HEIGHT,
    transparent: true,
    frame: false,
    skipTaskbar: true,
    focusable: false,
    alwaysOnTop: true,
    show: false, // Hidden by default
    webPreferences: {
      nodeIntegration: false,      // SECURITY: Disabled Node.js in renderer
      contextIsolation: true,       // SECURITY: Enabled context isolation
      preload: path.join(__dirname, 'preload.js') // Secure IPC bridge
    },
  });

  overlayWindow.loadFile('overlay-enhanced.html'); // Use enhanced overlay

  // Load and apply saved transparency setting
  overlayWindow.webContents.on('did-finish-load', () => {
    // Get saved transparency from control panel settings
    overlayWindow.webContents.executeJavaScript(`
      (function() {
        try {
          const settings = JSON.parse(localStorage.getItem('yordlepedia-settings')) || {};
          return settings.transparency || 90;
        } catch(e) {
          return 90;
        }
      })()
    `).then(transparency => {
      const opacity = transparency / 100;
      overlayWindow.setOpacity(opacity);
      console.log(`Applied saved transparency: ${transparency}%`);
    }).catch(err => {
      console.warn('Could not load saved transparency:', err);
    });
  });

  overlayWindow.setIgnoreMouseEvents(true);

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  console.log('Overlay window created (hidden until game starts)');
}

// Initialize League Client connection
async function initializeLCU() {
  lcuConnector = new LCUConnector();
  liveGameConnector = new LiveGameConnector(); // Create live game connector
  fullscreenDetector = new FullscreenDetector(); // Create fullscreen detector

  // Check if overlay will work with current League settings
  if (!hasShownFullscreenWarning && mainWindow) {
    const compatible = fullscreenDetector.isOverlayCompatible();
    if (!compatible) {
      console.warn('League is in exclusive fullscreen - overlay may not be visible');
      // Show warning after 2 seconds (let UI load first)
      setTimeout(() => {
        fullscreenDetector.showCompatibilityWarning(mainWindow);
        hasShownFullscreenWarning = true;
      }, 2000);
    } else {
      console.log('League settings compatible with overlay');
    }
  }

  // Try to connect
  const connected = await lcuConnector.connect();

  if (connected) {
    reconnectAttempts = 0; // Reset counter on successful connection
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

    // IMPROVEMENT: Exponential backoff with max retries
    if (reconnectAttempts < CONFIG.MAX_RECONNECT_ATTEMPTS) {
      const delay = Math.min(
        CONFIG.RECONNECT_INTERVAL * Math.pow(1.5, reconnectAttempts),
        30000 // Max 30 seconds
      );
      reconnectAttempts++;
      console.log(`Retrying connection in ${Math.round(delay / 1000)}s (Attempt ${reconnectAttempts}/${CONFIG.MAX_RECONNECT_ATTEMPTS})`);
      setTimeout(() => initializeLCU(), delay);
    } else {
      console.error('Max reconnection attempts reached. Please restart the League Client.');
      sendConnectionStatus({ connected: false, message: 'Connection failed. Please restart League Client.' });
    }
  }
}

// Start polling for live game data
function startGameDataPolling() {
  // FIXED: Prevent multiple polling intervals
  if (gameDataInterval) {
    console.log('Polling already active, skipping duplicate start');
    return;
  }

  gameDataInterval = setInterval(async () => {
    try {
      // OPTIMIZATION: Check connection before polling
      if (!lcuConnector || !lcuConnector.connected) {
        console.warn('LCU disconnected, stopping polling');
        clearInterval(gameDataInterval);
        return;
      }

      // Check gameflow phase
      const phase = await lcuConnector.getGameflowPhase();

      if (phase === 'InProgress') {
        // Show overlay if hidden (but only if user didn't manually hide it)
        if (overlayWindow && !overlayWindow.isVisible() && !overlayManuallyHidden) {
          overlayWindow.show();
          console.log('Game detected - overlay shown');
        }

        // Get game data from Live Client API (port 2999)
        const allGameData = await liveGameConnector.getAllGameData();
        const activePlayer = await liveGameConnector.getActivePlayerData();

        if (allGameData || activePlayer) {
          // DEBUG: Log the actual data structure
          console.log('Active Player Data:', JSON.stringify(activePlayer, null, 2));

          if (allGameData) {
            if (allGameData.gameData) {
              console.log('Game Time:', allGameData.gameData.gameTime);
            }
            if (allGameData.allPlayers) {
              console.log('All Players Count:', allGameData.allPlayers.length);
            } else {
              console.warn('allGameData.allPlayers is missing!');
            }
          } else {
            console.warn('allGameData is null/undefined');
          }

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
          console.log('Not in game - overlay hidden');
        }

        sendConnectionStatus({
          connected: true,
          inGame: false,
          phase: phase
        });
      }
    } catch (error) {
      console.error('Error polling game data:', error.message);
      // IMPROVEMENT: Stop polling on repeated errors
      if (error.message.includes('ECONNREFUSED') || error.message.includes('Not connected')) {
        console.error('Connection lost, attempting to reconnect...');
        clearInterval(gameDataInterval);
        initializeLCU(); // Attempt reconnection
      }
    }
  }, CONFIG.POLLING_INTERVAL);
}

// Handle gameflow phase changes
function handleGameflowChange(data) {
  const phase = typeof data === 'string' ? data : data.data;

  console.log(`Game phase: ${phase}`);

  if (phase === 'InProgress') {
    console.log('Game started! Showing overlay and monitoring live data...');
    // Show overlay when game starts (unless user manually hid it)
    if (overlayWindow && !overlayWindow.isVisible() && !overlayManuallyHidden) {
      overlayWindow.show();
      console.log('Overlay now visible');
    }
    startGameDataPolling();
  } else if (phase === 'EndOfGame') {
    console.log('Game ended - hiding overlay');
    // Hide overlay when game ends and reset manual hide flag
    if (overlayWindow && overlayWindow.isVisible()) {
      overlayWindow.hide();
      console.log('Overlay hidden');
    }
    overlayManuallyHidden = false; // Reset for next game
    // Clear interval and set to null to prevent duplicates
    if (gameDataInterval) {
      clearInterval(gameDataInterval);
      gameDataInterval = null;
    }
  } else {
    // Hide overlay in lobby/champ select
    if (overlayWindow && overlayWindow.isVisible() && !overlayManuallyHidden) {
      overlayWindow.hide();
      console.log('Overlay hidden (not in game)');
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
      console.log('Overlay hidden by hotkey (Ctrl+Shift+O)');
    } else {
      overlayWindow.show();
      overlayManuallyHidden = false;
      console.log('Overlay shown by hotkey (Ctrl+Shift+O)');
    }
  }
}

app.whenReady().then(async () => {
  try {
    createMainWindow();
    await createOverlayWindow();

    // Register global hotkey: Ctrl+Shift+O
    const hotkey = globalShortcut.register(CONFIG.HOTKEY, () => {
      toggleOverlay();
    });

    if (hotkey) {
      console.log('Hotkey registered: ${CONFIG.HOTKEY} to toggle overlay`);
    } else {
      console.error('Failed to register hotkey');
    }

    // Initialize LCU connection
    await initializeLCU();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  } catch (error) {
    console.error('Fatal error during initialization:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  // CLEANUP: Proper resource cleanup
  console.log(' Cleaning up resources...');

  // Unregister all shortcuts
  globalShortcut.unregisterAll();

  // Disconnect LCU and remove all listeners
  if (lcuConnector) {
    lcuConnector.removeAllListeners(); //  Prevent memory leaks
    lcuConnector.disconnect();
  }

  // Clear polling interval
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

// Edit mode toggle
ipcMain.on('edit-mode-toggle', (event, enabled) => {
  console.log('Edit mode:', enabled ? 'enabled' : 'disabled');
  if (overlayWindow) {
    overlayWindow.webContents.send('edit-mode-toggle', enabled);
    // Make overlay clickable in edit mode
    overlayWindow.setIgnoreMouseEvents(!enabled);
    // Show overlay for editing
    if (enabled && !overlayWindow.isVisible()) {
      overlayWindow.show();
    }
  }
});

// Transparency control
ipcMain.on('transparency-change', (event, opacity) => {
  console.log('Transparency changed to:', Math.round(opacity * 100) + '%');
  if (overlayWindow) {
    // Set window opacity (Electron native method)
    overlayWindow.setOpacity(opacity);
    // Also send to overlay for any additional styling
    overlayWindow.webContents.send('transparency-change', opacity);
  }
});

//  Test mode with sample data
ipcMain.on('test-mode', (event, enabled) => {
  console.log('Test mode triggered');
  if (overlayWindow) {
    // Show overlay
    if (!overlayWindow.isVisible()) {
      overlayWindow.show();
    }

    // Send sample game data
    const sampleData = {
      activePlayer: {
        level: 18,
        currentGold: 12500,
        summonerName: 'TestPlayer'
      },
      allGameData: {
        gameData: {
          gameTime: 1800 // 30 minutes
        },
        allPlayers: [
          {
            summonerName: 'TestPlayer',
            team: 'ORDER',
            scores: {
              creepScore: 245,
              kills: 8,
              deaths: 3,
              assists: 12,
              wardScore: 45
            }
          },
          {
            summonerName: 'Teammate1',
            team: 'ORDER',
            scores: { creepScore: 180, kills: 4, deaths: 5, assists: 10, wardScore: 30 }
          },
          {
            summonerName: 'Teammate2',
            team: 'ORDER',
            scores: { creepScore: 210, kills: 6, deaths: 4, assists: 11, wardScore: 38 }
          },
          {
            summonerName: 'Teammate3',
            team: 'ORDER',
            scores: { creepScore: 95, kills: 2, deaths: 6, assists: 15, wardScore: 65 }
          },
          {
            summonerName: 'Teammate4',
            team: 'ORDER',
            scores: { creepScore: 160, kills: 5, deaths: 4, assists: 9, wardScore: 25 }
          },
          {
            summonerName: 'Enemy1',
            team: 'CHAOS',
            scores: { creepScore: 220, kills: 7, deaths: 5, assists: 8, wardScore: 35 }
          },
          {
            summonerName: 'Enemy2',
            team: 'CHAOS',
            scores: { creepScore: 190, kills: 5, deaths: 6, assists: 9, wardScore: 28 }
          },
          {
            summonerName: 'Enemy3',
            team: 'CHAOS',
            scores: { creepScore: 205, kills: 6, deaths: 5, assists: 10, wardScore: 40 }
          },
          {
            summonerName: 'Enemy4',
            team: 'CHAOS',
            scores: { creepScore: 85, kills: 1, deaths: 7, assists: 12, wardScore: 55 }
          },
          {
            summonerName: 'Enemy5',
            team: 'CHAOS',
            scores: { creepScore: 150, kills: 4, deaths: 6, assists: 7, wardScore: 20 }
          }
        ]
      }
    };

    // Send connection status
    overlayWindow.webContents.send('connection-status', {
      connected: true,
      inGame: true,
      phase: 'InProgress'
    });

    // Send game data
    setTimeout(() => {
      overlayWindow.webContents.send('game-data-update', sampleData);
    }, 500);

    console.log('Sample data sent to overlay');
  }
});

// Hotkey change
ipcMain.on('hotkey-change', (event, newHotkey) => {
  console.log('⌨️ Changing hotkey to:', newHotkey);

  // Unregister old hotkey
  globalShortcut.unregisterAll();

  // Register new hotkey
  const registered = globalShortcut.register(newHotkey, () => {
    toggleOverlay();
  });

  if (registered) {
    console.log(`Hotkey registered: ${newHotkey}`);
  } else {
    console.error(`Failed to register hotkey: ${newHotkey}`);
  }
});

//  Reset panel positions
ipcMain.on('reset-positions', (event) => {
  console.log('Resetting panel positions');
  if (overlayWindow) {
    overlayWindow.webContents.send('reset-positions');
  }
});

console.log('Yordlepedia with League Client API starting...');

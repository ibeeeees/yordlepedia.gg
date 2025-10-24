/**
 * CONTROL PANEL RENDERER SCRIPT
 *
 * Purpose: Handles UI interactions and settings management
 * Storage: Uses localStorage for persistent settings
 * Communication: Uses window.electronAPI from preload.js for IPC
 */

// ==================== SETTINGS MANAGEMENT ====================

/**
 * Default settings object
 */
const defaultSettings = {
    showStats: true,
    showCooldowns: true,
    enableAiTips: false,
    tipFrequency: 'medium',
    voiceTips: false,
    overlayPosition: 'middle-center',
    transparency: 90,
    hotkey: 'CommandOrControl+Shift+O'
};

/**
 * Load settings from localStorage
 * @returns {Object} Settings object
 */
function loadSettings() {
    try {
        const stored = localStorage.getItem('yordlepedia-settings');
        if (stored) {
            return { ...defaultSettings, ...JSON.parse(stored) };
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
    return defaultSettings;
}

/**
 * Save settings to localStorage
 * @param {Object} settings - Settings object to save
 */
function saveSettings(settings) {
    try {
        localStorage.setItem('yordlepedia-settings', JSON.stringify(settings));
        console.log('Settings saved:', settings);
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// ==================== UI INITIALIZATION ====================

/**
 * Initialize UI with saved settings
 */
function initializeUI() {
    const settings = loadSettings();

    // Apply checkbox states
    document.getElementById('show-stats').checked = settings.showStats;
    document.getElementById('show-cooldowns').checked = settings.showCooldowns;
    document.getElementById('enable-ai-tips').checked = settings.enableAiTips;
    document.getElementById('voice-tips').checked = settings.voiceTips;

    // Apply dropdown selection
    document.getElementById('tip-frequency').value = settings.tipFrequency;

    // Apply position selection
    document.querySelectorAll('.pos-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-position') === settings.overlayPosition) {
            btn.classList.add('active');
        }
    });

    // Apply transparency slider
    const transparencySlider = document.getElementById('transparency-slider');
    const transparencyValue = document.getElementById('transparency-value');
    if (transparencySlider && transparencyValue) {
        transparencySlider.value = settings.transparency;
        transparencyValue.textContent = `${settings.transparency}%`;
    }

    // Apply hotkey display
    renderHotkeyDisplay(settings.hotkey);

    // Update AI status display
    updateAiStatus(settings.enableAiTips);

    console.log('Control panel UI initialized with settings:', settings);
}

/**
 * Update AI status display
 * @param {boolean} enabled - Whether AI tips are enabled
 */
function updateAiStatus(enabled) {
    const aiStatus = document.getElementById('ai-status');
    if (enabled) {
        aiStatus.textContent = 'Active';
        aiStatus.className = 'status-value active';
    } else {
        aiStatus.textContent = 'Disabled';
        aiStatus.className = 'status-value';
    }
}

/**
 * Render hotkey display with styled keyboard keys
 * @param {string} hotkeyString - Hotkey string (e.g., "CommandOrControl+Shift+O")
 */
function renderHotkeyDisplay(hotkeyString) {
    const hotkeyDisplay = document.getElementById('hotkey-display');
    if (!hotkeyDisplay) return;

    // Clear existing content
    hotkeyDisplay.innerHTML = '';

    // Parse hotkey string
    const keys = hotkeyString.split('+');
    const modifiers = ['COMMANDORCONTROL', 'CTRL', 'CONTROL', 'SHIFT', 'ALT', 'CMD', 'COMMAND', 'META'];

    keys.forEach((key, index) => {
        const keyUpper = key.toUpperCase();
        const isModifier = modifiers.includes(keyUpper);

        // Create key element
        const keyEl = document.createElement('span');
        keyEl.className = isModifier ? 'hotkey-key modifier' : 'hotkey-key';

        // Display friendly names
        let displayText = key;
        if (keyUpper === 'COMMANDORCONTROL') {
            displayText = navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl';
        } else if (keyUpper === 'CONTROL' || keyUpper === 'CTRL') {
            displayText = 'Ctrl';
        } else if (keyUpper === 'COMMAND' || keyUpper === 'CMD' || keyUpper === 'META') {
            displayText = 'Cmd';
        } else if (keyUpper === 'SHIFT') {
            displayText = 'Shift';
        } else if (keyUpper === 'ALT') {
            displayText = 'Alt';
        }

        keyEl.textContent = displayText;
        hotkeyDisplay.appendChild(keyEl);

        // Add + separator between keys
        if (index < keys.length - 1) {
            const separator = document.createElement('span');
            separator.className = 'hotkey-separator';
            separator.textContent = '+';
            hotkeyDisplay.appendChild(separator);
        }
    });
}

// ==================== EVENT LISTENERS ====================

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    const settings = loadSettings();

    // Overlay Settings Checkboxes
    document.getElementById('show-stats').addEventListener('change', (e) => {
        settings.showStats = e.target.checked;
        saveSettings(settings);
        console.log('Stats display:', settings.showStats ? 'enabled' : 'disabled');
    });

    document.getElementById('show-cooldowns').addEventListener('change', (e) => {
        settings.showCooldowns = e.target.checked;
        saveSettings(settings);
        console.log('Cooldowns display:', settings.showCooldowns ? 'enabled' : 'disabled');
    });

    document.getElementById('enable-ai-tips').addEventListener('change', (e) => {
        settings.enableAiTips = e.target.checked;
        saveSettings(settings);
        updateAiStatus(settings.enableAiTips);
        console.log('AI tips:', settings.enableAiTips ? 'enabled' : 'disabled');
    });

    // AI Coach Settings
    document.getElementById('tip-frequency').addEventListener('change', (e) => {
        settings.tipFrequency = e.target.value;
        saveSettings(settings);
        console.log('Tip frequency changed to:', settings.tipFrequency);
    });

    document.getElementById('voice-tips').addEventListener('change', (e) => {
        settings.voiceTips = e.target.checked;
        saveSettings(settings);
        console.log('Voice tips:', settings.voiceTips ? 'enabled' : 'disabled');
    });

    // Position Grid Buttons
    document.querySelectorAll('.pos-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            document.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            // Save position
            const position = btn.getAttribute('data-position');
            settings.overlayPosition = position;
            saveSettings(settings);
            console.log('Overlay position set to:', position);

            // TODO: Send position update to overlay window via IPC
        });
    });

    // Transparency Slider
    const transparencySlider = document.getElementById('transparency-slider');
    const transparencyValue = document.getElementById('transparency-value');

    if (transparencySlider) {
        transparencySlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            settings.transparency = value;
            transparencyValue.textContent = `${value}%`;
            saveSettings(settings);

            // Send transparency update to overlay
            if (window.electronAPI && window.electronAPI.sendTransparencyChange) {
                window.electronAPI.sendTransparencyChange(value / 100);
            }
            console.log('Transparency set to:', value);
        });
    }

    // Hotkey Change Button
    let isCapturingHotkey = false;
    const hotkeyDisplay = document.getElementById('hotkey-display');
    const changeHotkeyBtn = document.getElementById('change-hotkey-btn');

    if (changeHotkeyBtn) {
        changeHotkeyBtn.addEventListener('click', () => {
            if (isCapturingHotkey) {
                // Cancel capture
                isCapturingHotkey = false;
                changeHotkeyBtn.textContent = 'Change Hotkey';
                changeHotkeyBtn.classList.remove('capturing');
                renderHotkeyDisplay(settings.hotkey);
            } else {
                // Start capture
                isCapturingHotkey = true;
                changeHotkeyBtn.textContent = 'Press a key combination...';
                changeHotkeyBtn.classList.add('capturing');
                hotkeyDisplay.innerHTML = '<span style="color: #0bc6e3; font-size: 14px;">Press any key combination...</span>';
            }
        });
    }

    // Capture hotkey on keydown (global capture)
    document.addEventListener('keydown', (e) => {
        if (!isCapturingHotkey) return;

        e.preventDefault();

        const modifiers = [];
        if (e.ctrlKey || e.metaKey) modifiers.push('CommandOrControl');
        if (e.shiftKey) modifiers.push('Shift');
        if (e.altKey) modifiers.push('Alt');

        const key = e.key.toUpperCase();

        // Ignore modifier-only presses
        if (['CONTROL', 'SHIFT', 'ALT', 'META'].includes(key)) return;

        const hotkeyString = [...modifiers, key].join('+');

        settings.hotkey = hotkeyString;
        renderHotkeyDisplay(hotkeyString);
        saveSettings(settings);

        isCapturingHotkey = false;
        changeHotkeyBtn.textContent = 'Change Hotkey';
        changeHotkeyBtn.classList.remove('capturing');

        // Send hotkey update to main process
        if (window.electronAPI && window.electronAPI.sendHotkeyChange) {
            window.electronAPI.sendHotkeyChange(hotkeyString);
        }

        console.log('Hotkey changed to:', hotkeyString);
    });

    // Quick Action Buttons
    document.getElementById('test-overlay').addEventListener('click', () => {
        console.log('Test overlay clicked');
        if (window.electronAPI && window.electronAPI.sendTestMode) {
            window.electronAPI.sendTestMode(true);
        } else {
            console.warn('electronAPI not available');
        }
    });

    const editLayoutBtn = document.getElementById('edit-layout-btn');
    let editModeActive = false;

    if (editLayoutBtn) {
        editLayoutBtn.addEventListener('click', () => {
            editModeActive = !editModeActive;

            if (editModeActive) {
                editLayoutBtn.textContent = 'Exit Edit Mode';
                editLayoutBtn.classList.add('active');
            } else {
                editLayoutBtn.textContent = 'Edit Layout Mode';
                editLayoutBtn.classList.remove('active');
            }

            // Send edit mode toggle to overlay
            if (window.electronAPI && window.electronAPI.sendEditModeToggle) {
                window.electronAPI.sendEditModeToggle(editModeActive);
            }

            console.log('Edit mode:', editModeActive ? 'enabled' : 'disabled');
        });
    }

    document.getElementById('toggle-tips-btn').addEventListener('click', () => {
        console.log('💬 Toggle AI tips clicked');
        if (window.electronAPI && window.electronAPI.sendToggleTipBox) {
            // Toggle tip box visibility
            window.electronAPI.sendToggleTipBox(true);
            setTimeout(() => {
                window.electronAPI.sendToggleTipBox(false);
            }, 5000); // Hide after 5 seconds
        } else {
            console.warn('electronAPI not available');
        }
    });

    const resetPositionsBtn = document.getElementById('reset-positions-btn');
    if (resetPositionsBtn) {
        resetPositionsBtn.addEventListener('click', () => {
            console.log('Reset panel positions clicked');
            if (confirm('Reset all overlay panels to default positions?')) {
                localStorage.removeItem('yordlepedia-panel-positions');

                // Notify overlay to reload positions
                if (window.electronAPI && window.electronAPI.sendResetPositions) {
                    window.electronAPI.sendResetPositions();
                }

                console.log('Panel positions reset');
            }
        });
    }
}

// ==================== STATUS MONITORING ====================

/**
 * Update game status display
 * @param {Object} status - Connection status object
 */
function updateGameStatus(status) {
    const gameStatus = document.getElementById('game-status');
    const overlayStatus = document.getElementById('overlay-status');

    if (status.connected && status.inGame) {
        gameStatus.textContent = 'In Game';
        gameStatus.className = 'status-value active';
        overlayStatus.textContent = 'Active';
        overlayStatus.className = 'status-value active';
    } else if (status.connected) {
        gameStatus.textContent = status.phase || 'Connected';
        gameStatus.className = 'status-value warning';
        overlayStatus.textContent = 'Standby';
        overlayStatus.className = 'status-value warning';
    } else {
        gameStatus.textContent = 'Not Connected';
        gameStatus.className = 'status-value';
        overlayStatus.textContent = 'Inactive';
        overlayStatus.className = 'status-value';
    }
}

/**
 * Poll game status from main process
 */
async function pollGameStatus() {
    if (window.electronAPI && window.electronAPI.getGameStatus) {
        try {
            const status = await window.electronAPI.getGameStatus();
            updateGameStatus(status);
        } catch (error) {
            console.error('Error fetching game status:', error);
        }
    }
}

// ==================== IPC LISTENERS ====================

/**
 * Setup IPC listeners for main process communication
 */
function setupIPCListeners() {
    if (!window.electronAPI) {
        console.error('❌ electronAPI not available - preload script may have failed');
        return;
    }

    // Listen for connection status updates
    window.electronAPI.onConnectionStatus((status) => {
        console.log('Connection status update:', status);
        updateGameStatus(status);
    });

    console.log('IPC listeners registered');
}

// ==================== INITIALIZATION ====================

/**
 * Main initialization function
 */
function init() {
    console.log('🚀 Initializing Yordlepedia Control Panel...');

    initializeUI();
    setupEventListeners();
    setupIPCListeners();

    // Start polling game status every 5 seconds
    setInterval(pollGameStatus, 5000);
    pollGameStatus(); // Initial poll

    console.log('Control panel ready');
}

// ==================== STARTUP ====================

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ==================== CLEANUP ====================

/**
 * Cleanup on window unload
 */
window.addEventListener('beforeunload', () => {
    console.log('Control panel shutting down');
    // Remove IPC listeners if needed
    if (window.electronAPI && window.electronAPI.removeListener) {
        window.electronAPI.removeListener('connection-status');
    }
});

// ==================== UTILITIES ====================

/**
 * Get current settings (for debugging)
 */
window.getSettings = function() {
    return loadSettings();
};

/**
 * Reset settings to defaults (for debugging)
 */
window.resetSettings = function() {
    saveSettings(defaultSettings);
    initializeUI();
    console.log('Settings reset to defaults');
};

console.log('Control panel script loaded');

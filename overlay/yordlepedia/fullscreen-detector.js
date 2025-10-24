/**
 * FULLSCREEN MODE DETECTOR
 *
 * Purpose: Detects if League of Legends is running in exclusive fullscreen
 *          and provides instructions to users to switch to borderless mode
 *
 * Why: Electron overlays cannot appear on top of exclusive fullscreen games
 *      Only borderless windowed mode allows overlays to work
 */

const fs = require('fs');
const path = require('path');
const { dialog } = require('electron');

class FullscreenDetector {
  constructor() {
    this.leagueConfigPaths = [
      'C:\\Riot Games\\League of Legends\\Config\\game.cfg',
      path.join(process.env.USERPROFILE, 'Riot Games', 'League of Legends', 'Config', 'game.cfg')
    ];
  }

  /**
   * Check League's window mode from config file
   * @returns {number|null} 0=Windowed, 1=Fullscreen, 2=Borderless, null=not found
   */
  getLeagueWindowMode() {
    for (const configPath of this.leagueConfigPaths) {
      if (fs.existsSync(configPath)) {
        try {
          const config = fs.readFileSync(configPath, 'utf8');

          // Look for WindowMode setting
          const match = config.match(/WindowMode\s*=\s*(\d+)/i);
          if (match) {
            return parseInt(match[1]);
          }
        } catch (error) {
          console.error('Error reading League config:', error);
        }
      }
    }
    return null;
  }

  /**
   * Check if overlay will work with current League settings
   * @returns {boolean}
   */
  isOverlayCompatible() {
    const mode = this.getLeagueWindowMode();

    // Borderless (2) or Windowed (0) = Compatible
    // Fullscreen (1) = Not compatible
    // null (not found) = Assume compatible (user might not have played yet)

    if (mode === 1) {
      return false; // Exclusive fullscreen - overlay won't work
    }

    return true; // Borderless, windowed, or config not found
  }

  /**
   * Get user-friendly mode name
   * @param {number} mode
   * @returns {string}
   */
  getModeName(mode) {
    switch (mode) {
      case 0: return 'Windowed';
      case 1: return 'Fullscreen (Exclusive)';
      case 2: return 'Borderless';
      default: return 'Unknown';
    }
  }

  /**
   * Show dialog to user if overlay won't work
   * @param {BrowserWindow} mainWindow
   */
  async showCompatibilityWarning(mainWindow) {
    const mode = this.getLeagueWindowMode();

    if (mode !== 1) {
      return; // No warning needed
    }

    const result = await dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: 'Overlay Compatibility Issue',
      message: 'League of Legends is in Fullscreen Mode',
      detail: `Your overlay will NOT be visible in-game because League is set to "Fullscreen (Exclusive)" mode.

To make the overlay work, you need to change League to "Borderless" mode:

1. Start League of Legends
2. Press ESC in-game to open settings
3. Go to Video tab
4. Change "Window Mode" to "Borderless"
5. Click OK

The overlay will then work in your next game!

Note: Borderless mode has no performance impact and is used by most players.`,
      buttons: ['I Understand', 'Show Me How', 'Ignore'],
      defaultId: 0,
      cancelId: 2
    });

    if (result.response === 1) {
      // Show visual guide
      this.showVisualGuide(mainWindow);
    }

    return result.response;
  }

  /**
   * Show visual guide with instructions
   */
  async showVisualGuide(mainWindow) {
    await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'How to Enable Borderless Mode',
      message: 'Follow these steps:',
      detail: `STEP 1: Start League of Legends

STEP 2: During a game, press ESC

STEP 3: Click on "Video" tab

STEP 4: Find "Window Mode" dropdown

STEP 5: Select "Borderless"

STEP 6: Click "OK"

That's it! The overlay will now work in your next game.

WHY BORDERLESS?
• Allows overlays to appear
• Faster Alt+Tab
• No performance impact
• Used by Porofessor, Blitz, OP.GG

You can switch back to Fullscreen anytime.`,
      buttons: ['Got it!']
    });
  }

  /**
   * Try to automatically set borderless mode (requires admin)
   * @returns {boolean} Success
   */
  tryAutoFixWindowMode() {
    for (const configPath of this.leagueConfigPaths) {
      if (fs.existsSync(configPath)) {
        try {
          let config = fs.readFileSync(configPath, 'utf8');

          // Replace WindowMode=1 with WindowMode=2
          if (config.includes('WindowMode=1')) {
            config = config.replace(/WindowMode\s*=\s*1/gi, 'WindowMode=2');
            fs.writeFileSync(configPath, config, 'utf8');
            console.log('✅ Automatically changed League to Borderless mode');
            return true;
          }
        } catch (error) {
          console.error('❌ Failed to auto-fix window mode:', error);
          return false;
        }
      }
    }
    return false;
  }
}

module.exports = FullscreenDetector;

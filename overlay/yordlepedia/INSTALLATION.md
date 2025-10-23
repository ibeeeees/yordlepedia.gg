# Yordlepedia Installation & Setup Guide

## 📋 Prerequisites

Before installing Yordlepedia, ensure you have:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Windows 10/11** (for Windows users)
- **League of Legends** installed (optional for demo)

### Check Node.js Installation

```bash
node --version  # Should show v16.x or higher
npm --version   # Should show 8.x or higher
```

---

## 🚀 Quick Installation

### Step 1: Navigate to Project

```bash
cd C:\Users\Steel\Downloads\sample-app-master\yordlepedia
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- `electron` - Desktop app framework
- `electron-overlay-window` - Overlay functionality
- `electron-builder` - Build tools (dev dependency)

**Note**: Installation may take 1-2 minutes. You'll see some warnings about deprecated packages - these are safe to ignore.

### Step 3: Run Yordlepedia

```bash
npm start
```

Two windows will open:
1. **Control Panel** (400×600px window)
2. **Overlay Window** (Transparent, attaches to League of Legends)

---

## 🎮 First Launch

### What You'll See

#### Control Panel Window
- Header with Yordlepedia logo
- Overlay settings checkboxes
- AI coach configuration
- Position selector grid
- Quick action buttons
- Status indicators

#### Overlay Window
Initially transparent, showing:
- Loading screen indicator (appears after 2 seconds)
- Stats panel (top right) - with dummy data
- Cooldown tracker (top left) - showing 4 champions
- AI tip box (bottom right) - hidden by default

### Testing the Overlay

1. Click **"Test Overlay"** in the control panel
   - Random cooldowns will trigger
   - Watch timers count down in real-time

2. Click **"Toggle AI Tips"**
   - AI tip box slides in from the right
   - New tip appears every 30 seconds

3. Try different **overlay positions**
   - Click any position button (TL, TC, TR, etc.)
   - Overlay panels will reposition (future feature)

---

## ⚙️ Configuration

### Settings

All settings are saved automatically to `localStorage`:

#### Overlay Settings
- ☑ **Show Player Stats** - Display stats panel
- ☑ **Show Team Cooldowns** - Display cooldown tracker
- ☐ **Enable AI Tips** - Show AI tip box

#### AI Coach Settings
- **Tip Frequency**: Low (5min) / Medium (3min) / High (1min)
- **Voice Announcements**: Enable voice tips (future)

#### Overlay Position
9 position options:
```
TL   TC   TR
ML   MC   MR
BL   BC   BR
```

---

## 📊 Understanding the Interface

### Player Stats Panel

| Metric | Description | Good Value |
|--------|-------------|------------|
| **CS/min** | Creep score per minute | 7-10 |
| **Gold/min** | Gold generation rate | 300-400 |
| **Team Gold** | Total team gold | Varies |
| **Vision/min** | Wards per minute | 1-2 |
| **Gold Diff** | Gold advantage | Positive |
| **KDA** | Kill/Death/Assist | 2.0+ |

### Cooldown Tracker

For each champion, you'll see:
- **Q, W, E** - Basic abilities
- **R** - Ultimate ability
- **F, D** - Summoner spells

**Color Coding**:
- ⚫ Gray (default) - Not on cooldown
- 🔴 Red border - On cooldown
- 🟢 Green flash - Just became ready

### AI Tips

Tips are categorized by priority:
- 🟢 **Low** - General suggestions
- 🟠 **Medium** - Important reminders
- 🔴 **High** - Urgent actions

---

## 🐛 Troubleshooting

### Issue: "npm install" fails

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Try installing again
npm install
```

### Issue: Control panel opens but overlay doesn't show

**Possible causes**:
1. Overlay is transparent (expected behavior)
2. League of Legends not running
3. Overlay window minimized

**Solution**:
- Look for overlay in taskbar
- Click "Test Overlay" to see activity
- Check Task Manager for "Yordlepedia" processes

### Issue: Can't click on overlay elements

**Expected behavior**: Overlay is click-through by design. Use the control panel to interact with settings.

### Issue: Electron security warnings

**Solution**: These are development warnings and can be ignored for local testing.

### Issue: Stats not updating

**Current behavior**: This is a demo with dummy data. Stats simulate real-game values but aren't connected to actual League of Legends.

---

## 📁 Project Files

After installation, you'll have:

```
yordlepedia/
├── node_modules/          # Dependencies (auto-created)
├── assets/               # Icons and images
├── scripts/              # JavaScript logic
├── styles/               # CSS styling
├── main.js               # Electron entry point
├── overlay.html          # Overlay interface
├── control-panel.html    # Control panel interface
├── package.json          # Project config
└── package-lock.json     # Dependency lock file
```

---

## 🔄 Updating

To update Yordlepedia after code changes:

```bash
# Stop the app (Ctrl+C in terminal)

# Update dependencies if package.json changed
npm install

# Restart
npm start
```

---

## 🏗️ Building for Distribution

To create an executable:

### Windows
```bash
npm run build-win
```
Output: `dist/Yordlepedia Setup 1.0.0.exe`

### macOS
```bash
npm run build-mac
```
Output: `dist/Yordlepedia-1.0.0.dmg`

### Linux
```bash
npm run build-linux
```
Output: `dist/Yordlepedia-1.0.0.AppImage`

---

## 🗑️ Uninstalling

To remove Yordlepedia:

1. **Close the application**
2. **Delete the yordlepedia folder**
   ```bash
   cd C:\Users\Steel\Downloads\sample-app-master
   rmdir /s yordlepedia
   ```

Settings stored in browser localStorage will persist. To clear:
- Open Control Panel
- Press F12 (DevTools)
- Application → Local Storage → Clear

---

## 📝 Development Mode

### Running in Development

```bash
npm run dev
```

### Debugging

**Control Panel**:
- Press `Ctrl+Shift+I` to open DevTools
- View console logs
- Inspect elements
- Test localStorage

**Overlay Window**:
- Overlay DevTools not available (by design)
- Use `console.log` in `scripts/overlay.js`
- Logs visible in terminal

### Hot Reload

Changes to files require restart:
```bash
# Ctrl+C to stop
npm start
```

---

## 🔐 Security Notes

### Current Demo
- **No network requests** - Runs entirely locally
- **No data collection** - No analytics or tracking
- **No user accounts** - No authentication required
- **Safe for testing** - Uses only dummy data

### Future Production
When integrating with League of Legends:
- Use official Riot API only
- Never store credentials in code
- Respect rate limits
- Follow Riot's Terms of Service

---

## 🆘 Getting Help

### Documentation
1. **README.md** - Full feature documentation
2. **QUICK_START.md** - User guide
3. **PROJECT_SUMMARY.md** - Technical overview
4. **UI_LAYOUT.md** - Interface design guide

### Common Commands

```bash
# Start application
npm start

# Install dependencies
npm install

# Build for Windows
npm run build-win

# View installed packages
npm list --depth=0

# Check for updates
npm outdated
```

### Log Files

Electron logs location:
- **Windows**: `%APPDATA%\yordlepedia\logs`
- **macOS**: `~/Library/Logs/yordlepedia`
- **Linux**: `~/.config/yordlepedia/logs`

---

## ✅ Installation Checklist

- [ ] Node.js installed (v16+)
- [ ] Navigated to yordlepedia directory
- [ ] Ran `npm install` successfully
- [ ] Ran `npm start` successfully
- [ ] Control panel opens
- [ ] Overlay window appears (transparent)
- [ ] Tested overlay with "Test Overlay" button
- [ ] Toggled AI tips on/off
- [ ] Settings saved after restart

---

## 🎉 Success!

If you see both windows and can interact with the control panel, you're all set!

### Next Steps:
1. **Explore the interface** - Click around, test features
2. **Read QUICK_START.md** - Learn about all features
3. **Check UI_LAYOUT.md** - Understand the design
4. **Customize settings** - Adjust to your preferences

---

**Installation Date**: October 2025
**Version**: 1.0.0
**Status**: Demo Ready ✅

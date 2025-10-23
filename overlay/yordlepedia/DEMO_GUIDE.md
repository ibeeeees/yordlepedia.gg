# Yordlepedia Demo Guide

## 🎬 Demonstration Walkthrough

This guide walks you through demonstrating all features of Yordlepedia.

---

## 🚀 Launch Sequence

### Starting the Application

```bash
cd yordlepedia
npm start
```

**What Happens**:
1. Electron launches (2-3 seconds)
2. Control Panel window appears (400×600px)
3. Overlay window appears (transparent, full screen)
4. After 2 seconds: Loading screen indicator shows briefly

---

## 📋 Demo Script

### Part 1: Introduction (1 minute)

**Say**: "Yordlepedia is an overlay application for League of Legends that provides real-time statistics, team cooldown tracking, and AI-powered gameplay tips."

**Show**:
- Control Panel window with clean UI
- Yordlepedia logo and branding
- League of Legends themed colors (gold and blue)

---

### Part 2: Control Panel Tour (2 minutes)

#### Section 1: Overlay Settings

**Show**: Checkboxes for overlay components

| Setting | Description |
|---------|-------------|
| ☑ Show Player Stats | Displays stats panel on overlay |
| ☑ Show Team Cooldowns | Displays cooldown tracker |
| ☐ Enable AI Tips | Shows/hides AI tip box |

**Demonstrate**:
1. Check "Enable AI Tips"
2. **Say**: "Notice the status at the bottom changes to 'Enabled'"

#### Section 2: AI Coach Settings

**Show**: Configuration options

- **Tip Frequency**: Dropdown with Low/Medium/High
- **Voice Announcements**: Future feature checkbox

**Demonstrate**:
1. Change frequency to "High"
2. **Say**: "This would show tips every minute in a real game"

#### Section 3: Overlay Position

**Show**: 9-button grid layout

```
TL   TC   TR
ML   MC   MR
BL   BC   BR
```

**Demonstrate**:
1. Click different position buttons
2. **Say**: "You can position overlay elements anywhere on screen"
3. Notice the active button highlights in gold

#### Section 4: Quick Actions

**Show**: Three action buttons

1. **Test Overlay** (Gold/Primary)
2. **Toggle AI Tips**
3. **Reset Cooldowns**

We'll use these in Part 3.

#### Section 5: Status Monitor

**Show**: Real-time status indicators

| Status | Meaning |
|--------|---------|
| Game Status | Connection to League (simulated) |
| Overlay | Overlay window state |
| AI Coach | AI tips enabled/disabled |

**Note**: Game Status randomly changes in demo mode

---

### Part 3: Interactive Demo (3 minutes)

#### Demo 1: Test Overlay

**Steps**:
1. Click **"Test Overlay"** button
2. Watch the overlay window (if visible on second monitor or look at taskbar)
3. **Say**: "This triggers random cooldowns for all champions"

**What Happens**:
- All 4 champions get random cooldowns
- Basic abilities: 4-12 seconds
- Ultimate abilities: 60-120 seconds
- Summoner spells: 180-300 seconds
- Timers start counting down immediately

#### Demo 2: Toggle AI Tips

**Steps**:
1. Click **"Toggle AI Tips"** button
2. **Say**: "Watch the AI tip box slide in"

**What Happens**:
- Tip box slides in from bottom-right
- Shows a context-aware gameplay tip
- Priority level displayed (Low/Medium/High)
- Close button appears (×)

**Sample Tip**:
> "Your CS is below average for 12 minutes. Focus on last-hitting minions to increase your gold income."
>
> Priority: **Medium**

#### Demo 3: Reset Cooldowns

**Steps**:
1. After cooldowns are running, click **"Reset Cooldowns"**
2. **Say**: "All cooldowns instantly reset to zero"

**What Happens**:
- All timers set to 0
- Red borders disappear
- Brief green flash indicates "ready" state

---

### Part 4: Overlay Window Features (3 minutes)

To demonstrate the overlay, you'll need to either:
- Position windows side-by-side
- Use a second monitor
- Switch between windows

#### Feature 1: Player Stats Panel

**Location**: Top-right of overlay

**Stats Displayed**:
```
┌──────────────────────┐
│ [Y] PLAYER STATS     │
├──────────┬───────────┤
│ CS/min   │ Gold/min  │
│  7.2     │   342     │
├──────────┼───────────┤
│Team Gold │Vision/min │
│ 28.5k    │   1.3     │
├──────────┼───────────┤
│Gold Diff │    KDA    │
│ +2.1k    │   4.5     │
└──────────┴───────────┘
```

**Say**: "These stats update every second, simulating real game data"

**Point Out**:
- Gold Diff is green (positive) or red (negative)
- All values have realistic variance
- Panel has semi-transparent background
- Gold border matches League theme

#### Feature 2: Team Cooldown Tracker

**Location**: Top-left of overlay

**Layout**: 4 champions, each showing:
```
[Icon] Champion Name
Q  W  E  R  F  D
0  5  0  45 0  180
```

**Demonstrate**:
1. Point to a countdown timer
2. **Say**: "Watch the numbers count down in real-time"
3. When it reaches 0: "Green flash indicates ability is ready"

**Champion Examples**:
- **Ahri** - Mid lane mage
- **Lee Sin** - Jungle fighter
- **Thresh** - Support tank
- **Jinx** - ADC marksman

**Color States**:
- Gray border = Not on cooldown
- Red border = On cooldown (number > 0)
- Green border = Just became ready (3-second flash)

#### Feature 3: AI Tip Box

**Location**: Bottom-right of overlay

**Demonstrate**:
1. Enable AI tips from control panel
2. **Say**: "Tips rotate every 30 seconds"
3. Wait for tip change
4. **Say**: "Priority levels help you focus on what matters most"

**Tip Examples**:

**High Priority** (Red):
> "Enemy jungler spotted top side 30s ago. Play safe bot lane for the next minute."

**Medium Priority** (Orange):
> "Your CS is below average. Focus on last-hitting minions to increase gold income."

**Low Priority** (Green):
> "You're ahead in gold! Consider building defensive items to maintain your lead."

#### Feature 4: Loading Screen Indicator

**Timing**: Appears 2 seconds after launch

**Demonstrate**:
1. Restart the application
2. **Say**: "In champion select, you'll see this badge"
3. Point out the user count (e.g., "3/10")
4. **Say**: "Shows how many players are using Yordlepedia"

**Badge Design**:
- Central position
- Pulsing animation
- Gold border with blue accents
- Yordlepedia icon
- Auto-hides after 10 seconds

---

### Part 5: Real-Time Simulation (2 minutes)

**Demonstrate**: Leave the app running

**Point Out**:
1. **Stats panel** - Values change every second
   - CS/min increases slightly over time
   - Gold/min fluctuates
   - Gold diff varies

2. **Cooldown tracker** - Random abilities trigger
   - Approximately 1 in 10 seconds
   - Watch timers count down
   - Notice color changes

3. **AI tips** - Rotate automatically
   - New tip every 30 seconds
   - Different priorities
   - Relevant gameplay advice

---

## 🎨 Design Highlights

### Color Palette

**Show**: Visual consistency throughout

| Color | Hex | Usage |
|-------|-----|-------|
| Gold | #c89b3c | Primary accent, borders |
| Blue | #0bc6e3 | AI tips, special highlights |
| Dark | #0a1428 | Main background |
| Text | #f0e6d2 | Primary text color |
| Green | #00ff88 | Positive values, ready states |
| Red | #ff4458 | Negative values, cooldowns |

### Typography

**Point Out**:
- Clean, readable fonts (Segoe UI)
- Bold stat values for quick scanning
- Uppercase headers for hierarchy
- Proper contrast for visibility

### Animations

**Demonstrate**:
1. **Pulse animation** - Loading badge
2. **Slide-in** - AI tip box
3. **Countdown flash** - Active cooldowns
4. **Button hover** - Control panel interactions

---

## 💡 Key Talking Points

### 1. League of Legends Integration

**Say**: "Yordlepedia is designed to integrate with League of Legends"

**Current State**: Demo with dummy data
**Future State**: Real-time game data via League Client API

### 2. Non-Intrusive Overlay

**Say**: "The overlay is transparent and click-through"

**Benefits**:
- Doesn't block game view
- No interaction required during gameplay
- Positioned strategically (corners/edges)

### 3. AI-Powered Tips

**Say**: "Tips are context-aware and prioritized"

**Future Enhancement**:
- Integration with GPT/Claude
- Analysis of actual game state
- Personalized advice based on play style

### 4. Team Coordination

**Say**: "Cooldown tracking helps with team plays"

**Use Cases**:
- Know when allies have ultimates ready
- Track summoner spell cooldowns
- Coordinate engages and retreats

### 5. Performance Tracking

**Say**: "Stats help you improve your gameplay"

**Metrics Explained**:
- **CS/min**: Farming efficiency
- **Gold/min**: Income generation
- **Vision/min**: Map control contribution
- **KDA**: Combat effectiveness

---

## 🎯 Demo Scenarios

### Scenario 1: New User Setup

**Story**: First-time user installs Yordlepedia

1. Show installation (npm install)
2. Launch application
3. Tour control panel
4. Test overlay
5. Configure preferences

**Time**: 5 minutes

### Scenario 2: In-Game Usage

**Story**: Player using Yordlepedia during a match

1. Game starts
2. Stats begin tracking
3. Cooldowns update when abilities used
4. AI tips appear periodically
5. Player checks stats between fights

**Time**: 3 minutes (simulated)

### Scenario 3: Team Coordination

**Story**: Tracking teammate cooldowns for engage

1. Point to cooldown tracker
2. Show Lee Sin ultimate at 45 seconds
3. Show Thresh hook at 12 seconds
4. Explain decision-making

**Time**: 2 minutes

---

## 📊 Technical Demonstration (Advanced)

### Architecture

**Show**: File structure

```
yordlepedia/
├── main.js           # Electron main process
├── overlay.html      # Overlay UI
├── control-panel.html # Control panel UI
├── scripts/          # Business logic
└── styles/           # Styling
```

### Technologies

**List**:
- Electron for desktop app
- electron-overlay-window for overlay
- Vanilla JavaScript (no frameworks)
- CSS3 for animations
- localStorage for settings

### Data Flow

**Explain**:
1. Main process creates windows
2. IPC communication between windows
3. Overlay simulates game data
4. Control panel sends commands
5. Settings persist in localStorage

---

## 🐛 Troubleshooting Demo

### Common Questions

**Q**: "Why isn't the overlay visible?"
**A**: It's transparent by design. Click "Test Overlay" to see activity.

**Q**: "Can I move the panels?"
**A**: Use overlay position selector in control panel.

**Q**: "How do I integrate with real League data?"
**A**: Requires League Client API integration (future feature).

**Q**: "Is this allowed by Riot?"
**A**: Check Riot's Terms of Service. This demo uses no game data.

---

## 🎉 Closing

### Summary

**Recap**:
✅ Player stats tracking (6 metrics)
✅ Team cooldown tracker (4 champions, 6 abilities each)
✅ AI-powered tips (prioritized, contextual)
✅ Loading screen indicator (community feature)
✅ Customizable control panel
✅ League of Legends themed UI

### Next Steps

**For Users**:
1. Install and test locally
2. Explore all features
3. Provide feedback
4. Stay tuned for updates

**For Developers**:
1. Review codebase
2. Integrate League Client API
3. Add real-time data tracking
4. Implement AI service
5. Add more features

---

## 📝 Demo Checklist

Before presenting:

- [ ] Application installed (npm install completed)
- [ ] Node.js and npm working
- [ ] All files present
- [ ] Documentation read
- [ ] Practice demo script
- [ ] Prepare second monitor or window layout
- [ ] Test all features
- [ ] Note any quirks or limitations

During demo:

- [ ] Launch application smoothly
- [ ] Tour control panel clearly
- [ ] Demonstrate each feature
- [ ] Show real-time updates
- [ ] Explain use cases
- [ ] Answer questions
- [ ] Highlight design choices

After demo:

- [ ] Show documentation
- [ ] Share installation guide
- [ ] Provide project files
- [ ] Collect feedback
- [ ] Discuss future plans

---

**Demo Duration**: 10-15 minutes
**Difficulty**: Easy
**Audience**: Users, developers, stakeholders
**Status**: Ready for presentation ✅

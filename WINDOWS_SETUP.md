# Windows Setup Guide for Yordlepedia.gg

## Windows-Specific Setup

### Prerequisites for Windows
✅ **Node.js** - Already installed and working
✅ **npm** - Already installed and working  
✅ **Your API Key** - Already configured in `.env`

### No Global Installations Needed!
Unlike some guides that require global installations, everything is now installed locally in your project.

## Available Commands (Windows PowerShell/CMD)

### 🖥️ Local Development
```powershell
# Start regular Express server
npm start

# Start with auto-restart (development)
npm run dev
```

### ☁️ Serverless/Lambda Testing
```powershell
# Test Lambda environment locally
npm run offline

# Deploy to AWS (requires AWS CLI setup)
npm run deploy

# Deploy to production
npm run deploy:prod
```

## Windows-Specific Notes

### File Paths
- ✅ All file paths use forward slashes (works on Windows)
- ✅ Environment variables loaded from `.env` file
- ✅ No bash-specific commands used

### PowerShell vs Command Prompt
Both work fine! The npm scripts will work in:
- ✅ Windows PowerShell
- ✅ Command Prompt (cmd)
- ✅ VS Code integrated terminal
- ✅ Git Bash (if you have it)

### Port Configuration
- Default port: `3000`
- Windows Firewall: Usually allows local development automatically
- If port 3000 is busy, set `PORT=3001` in your `.env` file

## Testing Your Setup

### 1. Test Regular Server
```powershell
npm start
```
Then visit: http://localhost:3000

### 2. Test Lambda Environment
```powershell
npm run offline
```
Then visit: http://localhost:3000

Both should work identically!

## AWS Deployment from Windows

### Option 1: AWS CLI (Recommended)
1. Install AWS CLI from: https://aws.amazon.com/cli/
2. Configure: `aws configure`
3. Deploy: `npm run deploy`

### Option 2: AWS Console Upload
1. Zip your entire project folder
2. Upload to AWS Lambda through the web console
3. Set handler to: `server.handler`

## Troubleshooting Windows Issues

### "serverless command not found"
✅ **Fixed!** We installed it locally, use `npm run offline`

### Port already in use
```powershell
# Kill any running Node processes
taskkill /F /IM node.exe
```

### Environment variables not loading
Make sure your `.env` file is in the root directory:
```
C:\Users\16786\Documents\GitHub\yordlepedia.gg\.env
```

### File permission issues
Usually not a problem on Windows, but if you see permission errors:
1. Run PowerShell as Administrator
2. Or use Command Prompt instead

## Performance on Windows
- ✅ Same performance as Linux/Mac
- ✅ All caching works identically  
- ✅ Riot API calls work perfectly
- ✅ Lambda deployment works from Windows

Your Windows setup is fully supported! 🎉
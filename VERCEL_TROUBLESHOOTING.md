# Vercel Deployment Troubleshooting Guide

## Quick Diagnosis Steps

### 1. Check if Vercel deployed the latest code
- Go to your Vercel dashboard
- Check the latest deployment shows commit `406c196`
- If not, trigger a manual deployment

### 2. Test the API endpoints
Replace `your-app.vercel.app` with your actual Vercel URL:

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Debug info
curl https://your-app.vercel.app/api/debug

# API key test
curl https://your-app.vercel.app/api/test
```

### 3. Check Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
- Ensure `RIOT_API_KEY` is set
- Value should start with `RGAPI-`
- Should be available for Production, Preview, and Development

### 4. Test Summoner Search
```bash
# Test with your summoner name
curl "https://your-app.vercel.app/api/summoner?region=na1&name=YourName%23Tag"
```

## Expected Responses

### ✅ Healthy API
```json
{
  "status": "healthy",
  "hasApiKey": true,
  "apiKeyPrefix": "RGAPI-xxxxx..."
}
```

### ✅ Working Debug
```json
{
  "hasRiotApiKey": true,
  "apiKeyLength": 42,
  "vercelInfo": {
    "isVercel": true,
    "vercelEnv": "production"
  }
}
```

### ❌ Common Issues

**Missing API Key:**
```json
{
  "hasApiKey": false,
  "apiKeyPrefix": "NOT_SET"
}
```
**Solution:** Add RIOT_API_KEY in Vercel dashboard and redeploy

**Invalid API Key:**
```json
{
  "status": "API key is invalid or expired",
  "errorStatus": 403
}
```
**Solution:** Check your API key in Riot Developer Portal

**Rate Limited:**
```json
{
  "status": "Rate limit exceeded",
  "errorStatus": 429
}
```
**Solution:** Wait a few minutes and try again

## Manual Deployment

If automatic deployment isn't working:

```bash
# Using Vercel CLI
vercel --prod

# Or trigger from GitHub
# Go to GitHub → Actions → Re-run all jobs
```

## Local vs Vercel Differences

### Local (works):
- Uses `server.js` (full Node.js server)
- Environment variables from `.env` file
- Persistent memory and caching

### Vercel (might fail):
- Uses `api/index.js` (serverless function)
- Environment variables from Vercel dashboard
- Stateless execution, cold starts

## If Still Not Working

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Functions tab
   - Look for error logs in `/api/summoner` function

2. **Verify Latest Deployment:**
   - Commit hash should be `406c196`
   - Deployment should be marked as "Ready"

3. **Test Different Regions:**
   - NA1: `name=TestUser%23NA1&region=na1`
   - EUW1: `name=TestUser%23EUW&region=euw1`

4. **Environment Variable Debug:**
   - Check `/api/debug` endpoint
   - Should show `hasRiotApiKey: true`
   - Should show correct Vercel environment info
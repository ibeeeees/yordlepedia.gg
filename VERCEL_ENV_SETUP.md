# Vercel Environment Variables Setup

## Required Environment Variables

To fix the "summoner not found" error on Vercel, you need to configure the following environment variable in your Vercel dashboard:

### 1. RIOT_API_KEY (Required)
```
RIOT_API_KEY=RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## How to Set Environment Variables in Vercel

### Method 1: Vercel Dashboard
1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the sidebar
4. Click "Add New"
5. Enter the variable name: `RIOT_API_KEY`
6. Enter your Riot API key value
7. Select environments: Production, Preview, Development
8. Click "Save"

### Method 2: Vercel CLI
```bash
vercel env add RIOT_API_KEY
# Enter your API key when prompted
```

### Method 3: Environment Variable Import
Create a `.env.production` file (not committed to git):
```bash
RIOT_API_KEY=your_riot_api_key_here
```

Then import:
```bash
vercel env pull .env.production
```

## Verifying Setup

After setting the environment variables:

1. **Redeploy your application** (important - env vars require redeployment)
2. **Check the debug endpoint**: `https://your-app.vercel.app/api/debug`
3. **Check the health endpoint**: `https://your-app.vercel.app/api/health`

The debug endpoint should show:
```json
{
  "hasRiotApiKey": true,
  "apiKeyLength": 42,
  "apiKeyPrefix": "RGAPI-xxxxxxx..."
}
```

## Common Issues

### Issue: "summoner not found" error
**Cause**: Missing or invalid RIOT_API_KEY
**Solution**: Verify the API key is set correctly and redeploy

### Issue: API key shows as "NOT_SET"
**Cause**: Environment variable not configured in Vercel
**Solution**: Add RIOT_API_KEY in Vercel dashboard and redeploy

### Issue: Wrong region errors
**Cause**: API requests to wrong regional endpoints
**Solution**: This has been fixed in the latest deployment - make sure to redeploy

## Testing Regions

After setup, test different regions:
- NA: `https://your-app.vercel.app/api/summoner?region=na1&name=SummonerName%23Tag`
- EUW: `https://your-app.vercel.app/api/summoner?region=euw1&name=SummonerName%23Tag`
- KR: `https://your-app.vercel.app/api/summoner?region=kr&name=SummonerName%23Tag`

## Rate Limiting

The Production API key should handle reasonable traffic, but consider implementing:
- Response caching (already implemented - 5-15 minute TTL)
- Request throttling for high traffic
- User-specific rate limiting if needed
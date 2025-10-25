# API Key Verification Script

## Step 1: Check Your Local API Key
Your local API key: `RGAPI-97d889ae-6486-4a41-b22f-ca8cea0c5233`
- Length: 42 characters ✅
- Format: Starts with RGAPI- ✅
- Working locally: ✅

## Step 2: Verify Vercel Environment Variable

### Option A: Copy Exact Key
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `RIOT_API_KEY` and click the "..." menu → Edit
3. **Replace the entire value** with exactly this:
   ```
   RGAPI-97d889ae-6486-4a41-b22f-ca8cea0c5233
   ```
4. Make sure there are NO extra spaces, newlines, or hidden characters
5. Click Save

### Option B: Re-create the Variable
1. Delete the existing `RIOT_API_KEY` variable
2. Add a new one:
   - Name: `RIOT_API_KEY`
   - Value: `RGAPI-97d889ae-6486-4a41-b22f-ca8cea0c5233`
   - Environments: Production, Preview, Development (all checked)
3. Click Save

## Step 3: Force Redeploy
After updating the environment variable:
1. Go to Vercel Dashboard → Deployments
2. Click the "..." menu on the latest deployment → Redeploy
3. Wait for deployment to complete

## Step 4: Test the API
Once deployed, test these endpoints (replace `your-app.vercel.app`):

### Debug Info:
```
https://your-app.vercel.app/api/debug
```
Should show:
```json
{
  "hasRiotApiKey": true,
  "apiKeyLength": 42,
  "apiKeyPrefix": "RGAPI-97d889ae..."
}
```

### API Key Test:
```
https://your-app.vercel.app/api/test
```
Should show either:
- `"status": "API key working"` ✅
- `"status": "Test user not found (API key likely working)"` ✅ (this is actually good!)

### Summoner Search:
```
https://your-app.vercel.app/api/summoner?region=na1&name=Doublelift%23NA1
```

## Common Issues and Solutions

### Issue: "API key format invalid"
**Cause**: Extra characters in the environment variable
**Solution**: Re-copy the exact key from local .env file

### Issue: "API key length invalid"
**Cause**: Truncated or padded API key
**Solution**: Ensure exactly 42 characters, no spaces

### Issue: Still getting 403 after fixing
**Cause**: 
1. API key expired (check Riot Developer Portal)
2. API key has restricted permissions
3. Rate limiting from previous failed attempts

**Solution**: 
1. Generate a new API key from Riot Developer Portal
2. Update both local .env and Vercel environment variable
3. Redeploy

## Verification Checklist
- [ ] Local API key works (confirmed ✅)
- [ ] Vercel environment variable matches exactly
- [ ] Redeployed after changing environment variable  
- [ ] `/api/debug` shows correct API key info
- [ ] `/api/test` returns success or 404 (both good)
- [ ] Summoner search works
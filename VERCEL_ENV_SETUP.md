# Vercel Environment Variables Setup

Your Vercel deployment failed because environment variables aren't configured yet. Here's how to fix it:

## Step 1: Go to Your Vercel Project

1. Open https://vercel.com/dashboard
2. Click on your `yordlepedia-gg` project

## Step 2: Go to Settings

1. Click **Settings** (top menu)
2. Click **Environment Variables** (left sidebar)

## Step 3: Add Environment Variables

You need to add these variables. For now, you only need `RIOT_API_KEY` to get it working. The others are optional/for future use.

### Required (Add This First):

| Name | Value |
|------|-------|
| `RIOT_API_KEY` | `RGAPI-fa0d...6bf8c` (your actual Riot API key) |

### Optional (For Later):

| Name | Value | Notes |
|------|-------|-------|
| `AWS_REGION` | `us-east-1` | AWS region for Cognito |
| `COGNITO_USER_POOL_ID` | `us-east-1_AQR1MUiM7` | Your Cognito pool ID |
| `COGNITO_CLIENT_ID` | `7oigkkeplthcrdrrfetdam3u5s` | Your Cognito client ID |
| `COGNITO_CLIENT_SECRET` | `1hqcio8t2ve55bcpa107mhm4mk1ssd2d2ntsk11f4qnptesnh807` | Your Cognito client secret |
| `COGNITO_DOMAIN` | `us-east-1aqr1muim7.auth.us-east-1.amazoncognito.com` | Your Cognito domain |
| `RIOT_CLIENT_ID` | `xxxxx` | Get from Riot after approval |
| `RIOT_CLIENT_SECRET` | `xxxxx` | Get from Riot after approval |
| `DB_USER` | `postgres` | PostgreSQL username |
| `DB_PASSWORD` | `your_password` | PostgreSQL password |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `yordlepedia` | Database name |

## Step 4: Add RIOT_API_KEY

1. **Name:** `RIOT_API_KEY`
2. **Value:** Paste your Riot API key (from https://developer.riotgames.com)
   - Example: `RGAPI-fa0d...6bf8c`
3. **Click "Save"**

## Step 5: Redeploy

After adding the environment variable:

1. Go to **Deployments** (top menu)
2. Find the failed deployment (red X)
3. Click the **...** menu → **Redeploy**
4. OR just push a new commit to GitHub (it auto-deploys)

```bash
cd /Users/ibe/WebstormProjects/yordlepedia.gg
git commit --allow-empty -m "Trigger redeploy after adding environment variables"
git push
```

## What Gets Fixed

Once you add `RIOT_API_KEY`:
- ✅ Vercel deployment succeeds
- ✅ `/api/summoner/:summonerName` endpoint works
- ✅ Profile search works
- ✅ Stats cards populate
- ✅ Match history loads

## Minimal Setup for MVP

To get working right now:
1. ✅ Add `RIOT_API_KEY` only
2. ✅ Redeploy
3. ✅ App works with Riot API

You can add Cognito/database variables later when you're ready to implement authentication.

## Troubleshooting

### Still seeing "Environment Variable references Secret which does not exist"
- Make sure you clicked **Save** after entering the value
- Make sure the name is exactly `RIOT_API_KEY` (case-sensitive)
- Wait a few seconds and try redeploying

### Can't find my Riot API key
- Go to https://developer.riotgames.com
- Sign in to your account
- Look for "API Keys" in the dashboard
- Copy the full key (starts with `RGAPI-`)

### Still not working after adding variable
- Go to **Deployments**
- Click the last deployment
- Check the build logs for errors
- If needed, click **Redeploy**

## Next Steps

After this works:
1. Test the app on Vercel
2. Go to `/` and search for a summoner (e.g., "Faker")
3. You should see the profile with stats

Then you can add the other environment variables for Cognito setup.

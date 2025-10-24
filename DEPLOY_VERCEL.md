# Deploy to Vercel - Step by Step

Your code is now on GitHub and ready to deploy!

## Step 1: Go to Vercel Dashboard

1. Open https://vercel.com/dashboard
2. Sign in with GitHub (if not already signed in)

## Step 2: Import Project

1. Click **"New Project"**
2. Look for your `yordlepedia.gg` repository
3. Click **"Import"**

## Step 3: Configure Project

Vercel will auto-detect your `vercel.json` configuration.

**You'll see:**
- Framework Preset: Node.js ✓ (auto-detected)
- Root Directory: . (correct)
- Build Command: (not needed)

**Click "Deploy"** - Vercel will deploy your app!

## Step 4: Wait for Deployment

- Watch the deployment log scroll
- It should complete in 1-2 minutes
- Once done, you'll see a "Congratulations" message

## Step 5: Test Your Deployment

Once deployed, Vercel gives you a URL. Visit:

```
https://yordlepedia-gg.vercel.app/
```

Test these URLs work:

✅ **App home page:**
```
https://yordlepedia-gg.vercel.app/
```

✅ **API health check:**
```
https://yordlepedia-gg.vercel.app/api/health
```

✅ **Summoner search:**
```
https://yordlepedia-gg.vercel.app/api/summoner/ibes%23NA1
```

✅ **Privacy Policy:**
```
https://yordlepedia-gg.vercel.app/privacy
```

✅ **Terms of Service:**
```
https://yordlepedia-gg.vercel.app/tos
```

## Step 6: Add Environment Variables

After deployment, add your Riot API key:

1. In Vercel dashboard, click your project
2. Go to **Settings** → **Environment Variables**
3. Add:
   - Name: `RIOT_API_KEY`
   - Value: `your_riot_api_key_here`
4. Click **Save**
5. Click **"Redeploy"** (Vercel will rebuild with the new variable)

## Troubleshooting

### Deployment Failed
- Check the logs for errors
- Make sure `vercel.json` is valid (copied correctly)
- Make sure `api/index.js` exists

### API returns 404
- Make sure you redeployed after adding environment variables
- Check that `/api/index.js` exists in your repo

### "Cannot find module" errors
- Dependencies should auto-install from `package.json`
- Check `package.json` has all dependencies

## Your URLs After Deployment

```
Live App: https://yordlepedia-gg.vercel.app
Privacy: https://yordlepedia-gg.vercel.app/privacy
Terms: https://yordlepedia-gg.vercel.app/tos
API: https://yordlepedia-gg.vercel.app/api/
```

**Use these URLs in your Riot OAuth request!**

---

Once deployed, you can:
1. ✅ Submit Riot OAuth request with these URLs
2. ✅ Share your app with others
3. ✅ Continue building features while waiting for Riot approval

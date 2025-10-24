# Vercel Deployment Checklist

Quick checklist to deploy your app to Vercel.

## Pre-Deployment

- [ ] Have GitHub account with your repository pushed
- [ ] Have Vercel account (vercel.com)
- [ ] Riot API key ready
- [ ] All your AWS Cognito credentials ready

## Step 1: Connect to Vercel

1. Go to https://vercel.com
2. Click **"New Project"**
3. Select your `yordlepedia.gg` repository
4. Accept default settings (Vercel auto-detects `vercel.json`)
5. Click **"Deploy"**

## Step 2: Add Environment Variables

After deployment, add environment variables:

1. In Vercel dashboard, click your project
2. Go to **Settings** → **Environment Variables**
3. Add each variable:

| Variable | Value | Source |
|----------|-------|--------|
| `RIOT_API_KEY` | Your API key | developer.riotgames.com |
| `AWS_REGION` | `us-east-1` | AWS Cognito |
| `COGNITO_USER_POOL_ID` | `us-east-1_XXXXXXXXX` | AWS Cognito Setup |
| `COGNITO_CLIENT_ID` | From Step 3 | AWS Cognito Setup |
| `COGNITO_CLIENT_SECRET` | From Step 3 | AWS Cognito Setup |
| `COGNITO_DOMAIN` | `auth.yordlepedia.gg` | AWS Cognito Setup |
| `RIOT_CLIENT_ID` | From Riot OAuth | developer.riotgames.com |
| `RIOT_CLIENT_SECRET` | From Riot OAuth | developer.riotgames.com |
| `DB_HOST` | Your database host | PostgreSQL setup |
| `DB_USER` | Your DB username | PostgreSQL setup |
| `DB_PASSWORD` | Your DB password | PostgreSQL setup |
| `DB_NAME` | `yordlepedia` | PostgreSQL setup |
| `DB_PORT` | `5432` | PostgreSQL setup |

4. After adding variables, click **"Redeploy"** to apply them

## Step 3: Test Deployment

1. Go to https://yordlepedia-gg.vercel.app
2. Search for a summoner (e.g., `ibes#NA1`)
3. You should see live data from your Riot API
4. Check browser console for any errors

## Step 4: Update Cognito Redirect URIs

Since your app is now deployed at Vercel, update Cognito:

1. Go to AWS Console → Cognito → Your user pool
2. Go to **App integration** → **App clients** → Your app client
3. Update **Allowed redirect URIs** to include:
   - `https://yordlepedia-gg.vercel.app/auth/callback`
4. Update **Allowed sign-out URIs** to include:
   - `https://yordlepedia-gg.vercel.app/auth/logout`
5. Click **Save changes**

## Step 5: Verify API Endpoints

Test your API endpoints:

```bash
# Health check
curl https://yordlepedia-gg.vercel.app/api/health

# Summoner search
curl "https://yordlepedia-gg.vercel.app/api/summoner/ibes%23NA1"
```

## Troubleshooting

### "Cannot find module 'express'"
- Make sure `package.json` has express dependency
- Run `npm install` locally
- Vercel should auto-install dependencies

### API endpoints return 404
- Check `vercel.json` routes are correct
- Make sure `/api/index.js` exists
- Redeploy after creating new files

### Environment variables not working
- Add them in Vercel dashboard (not in .env)
- **Must redeploy** after adding variables
- Check variable names match exactly

### Summoner search returns demo data
- Check `RIOT_API_KEY` is set in Vercel environment variables
- Verify the key is valid
- Redeploy after setting the variable

### Database connection fails
- If using local PostgreSQL: won't work from Vercel (needs public host)
- Use AWS RDS or similar cloud database
- Update `DB_HOST` to cloud database URL

## After Successful Deployment

✅ Frontend: https://yordlepedia-gg.vercel.app
✅ Backend API: https://yordlepedia-gg.vercel.app/api/*
✅ Health check: https://yordlepedia-gg.vercel.app/api/health

Next steps:
1. Follow COGNITO_QUICKSTART.md to set up AWS Cognito
2. Implement authentication endpoints in backend
3. Build social features (timeline, posts, followers)

## File Structure

Your project now has these new files:

```
├── api/
│   └── index.js              ← Backend for Vercel
├── vercel.json               ← Vercel configuration
├── VERCEL_DEPLOYMENT.md      ← This guide
└── ...other files
```

## Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Your Project**: https://vercel.com/dashboard/yordlepedia-gg
- **Live App**: https://yordlepedia-gg.vercel.app
- **API Docs**: See VERCEL_DEPLOYMENT.md

---

Ready to deploy? Push your code to GitHub and Vercel will auto-deploy!

```bash
git add .
git commit -m "Add Vercel deployment configuration and API serverless function"
git push
```

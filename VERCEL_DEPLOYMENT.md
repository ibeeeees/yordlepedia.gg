# Deploy server.js to Vercel

Complete guide to deploy your Express backend to Vercel alongside your frontend.

---

## Step 1: Understand Vercel's Setup

Vercel can host both frontend and backend in one project:
- **Frontend**: `website.html` (SPA served at `/`)
- **Backend**: `server.js` converted to serverless functions in `/api` folder

## Step 2: Restructure Your Project for Vercel

Vercel expects your backend routes in an `/api` folder:

```
yordlepedia.gg/
├── website.html          # Frontend (served at /)
├── package.json
├── .env
├── vercel.json          # NEW - Vercel config
├── api/                 # NEW - Backend routes
│   ├── index.js         # Main Express app
│   └── middleware/      # (optional)
├── server.js            # Keep for local dev
└── ...other files
```

### Create the API Structure:

**Create `/api` folder:**
```bash
mkdir -p api
```

**Create `/api/index.js`** (copy from server.js):

Extract the Express app from `server.js` and put it in `/api/index.js`:

```javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Existing routes from server.js
app.get('/api/summoner/:summonerName', async (req, res) => {
  // Your existing summoner route code
});

// ... all your other routes

// Serve static files (website.html)
const path = require('path');
app.use(express.static(path.join(__dirname, '..')));

// Fallback to website.html for SPA
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../website.html'));
});

module.exports = app;
```

## Step 3: Create vercel.json

Create a `vercel.json` file in your root directory:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "website.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.js"
    },
    {
      "src": "/",
      "dest": "website.html"
    }
  ],
  "env": {
    "RIOT_API_KEY": "@riot_api_key",
    "COGNITO_USER_POOL_ID": "@cognito_user_pool_id",
    "COGNITO_CLIENT_ID": "@cognito_client_id",
    "COGNITO_CLIENT_SECRET": "@cognito_client_secret",
    "COGNITO_DOMAIN": "@cognito_domain",
    "RIOT_CLIENT_ID": "@riot_client_id",
    "RIOT_CLIENT_SECRET": "@riot_client_secret",
    "DB_USER": "@db_user",
    "DB_PASSWORD": "@db_password",
    "DB_HOST": "@db_host",
    "DB_PORT": "@db_port",
    "DB_NAME": "@db_name"
  }
}
```

## Step 4: Update package.json

Make sure your `package.json` has the right scripts:

```json
{
  "name": "yordlepedia-gg",
  "version": "1.0.0",
  "description": "League of Legends analytics platform",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build required'"
  },
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "axios": "^1.6.0",
    "dotenv": "^16.3.1",
    "pg": "^8.11.0",
    "jsonwebtoken": "^9.1.0",
    "oidc-client-ts": "^1.20.1"
  }
}
```

## Step 5: Connect Vercel to GitHub

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **"New Project"**
4. Select your `yordlepedia.gg` repository
5. Vercel will auto-detect your `vercel.json` configuration
6. Click **"Deploy"**

## Step 6: Add Environment Variables to Vercel

After deployment, configure environment variables:

1. In Vercel dashboard, go to your project
2. Click **"Settings"** → **"Environment Variables"**
3. Add each variable from your `.env`:

```
RIOT_API_KEY = your_api_key
COGNITO_USER_POOL_ID = us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID = xxxxxxxxxxxxx
COGNITO_CLIENT_SECRET = xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
COGNITO_DOMAIN = auth.yordlepedia.gg
RIOT_CLIENT_ID = xxxxxxxxxxxxx
RIOT_CLIENT_SECRET = xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DB_USER = postgres
DB_PASSWORD = your_password
DB_HOST = your_host
DB_PORT = 5432
DB_NAME = yordlepedia
```

⚠️ **DO NOT** commit `.env` to git - use Vercel's environment variables instead

## Step 7: Update Your Cognito Redirect URIs

After deployment, update Cognito to point to your new Vercel backend:

**In AWS Cognito:**
1. Go to your user pool → **App integration** → **App clients**
2. Click your app client
3. Update **Allowed redirect URIs** to include:
   - `https://yordlepedia-gg.vercel.app/auth/callback`
4. Update **Allowed sign-out URIs**:
   - `https://yordlepedia-gg.vercel.app/auth/logout`

## Step 8: Update Your Website to Use Correct API URLs

In `website.html`, update all API calls to use your Vercel backend:

```javascript
// Change from:
// const response = await fetch(`http://localhost:3000/api/summoner/${summonerName}`);

// To:
const API_BASE = window.location.origin; // Uses same domain
const response = await fetch(`${API_BASE}/api/summoner/${summonerName}`);
```

Or if your backend is on a different domain:

```javascript
const API_BASE = 'https://yordlepedia-gg.vercel.app';
const response = await fetch(`${API_BASE}/api/summoner/${summonerName}`);
```

## Step 9: Test Your Deployment

1. Go to https://yordlepedia-gg.vercel.app
2. Test summoner search:
   - You should see data from your backend
   - Check browser console for any errors
3. Test auth flow:
   - Click "Sign in with Riot"
   - Should redirect to Cognito
   - Should complete OAuth flow

## Troubleshooting

### "Cannot GET /api/summoner/:name"
- Make sure routes are defined in `/api/index.js`
- Check that `vercel.json` has correct routes
- Verify environment variables are set in Vercel

### "CORS error"
- Make sure `cors()` middleware is enabled in Express
- Check CORS settings allow your Vercel domain

### "Environment variables undefined"
- Go to Vercel project → Settings → Environment Variables
- Add all required variables
- **Redeploy** after adding variables
- Variables don't apply until you redeploy

### "Database connection failed"
- Ensure your database host is accessible from Vercel
- If using local PostgreSQL, it won't work (database must be accessible from internet)
- Consider AWS RDS or similar cloud database

### "Cognito redirect mismatch"
- Check redirect URI exactly matches (http vs https, trailing slashes)
- Update Cognito app client settings if changed
- Vercel uses HTTPS, make sure Cognito URIs use HTTPS too

## File Structure After Setup

```
yordlepedia.gg/
├── website.html              # Frontend SPA
├── server.js                 # Local development (npm start)
├── package.json
├── .env                      # Local only (in .gitignore)
├── .gitignore
├── vercel.json              # ← Vercel config (NEW)
├── api/
│   └── index.js            # ← Backend for Vercel (NEW)
├── auth.js
├── db.js
├── db-pool.js
├── database.sql
├── profile.html
├── README.md
└── ...other files
```

## Local Development vs Production

### Local Development (npm start)
```bash
npm start
# Runs server.js on http://localhost:3000
# Serves both frontend and backend locally
```

### Production (Vercel)
```bash
# Frontend deployed at: https://yordlepedia-gg.vercel.app
# Backend routes at: https://yordlepedia-gg.vercel.app/api/*
# Both served from same domain (no CORS issues!)
```

## Quick Checklist

- [ ] Create `/api/index.js` with Express app
- [ ] Create `vercel.json` with routes config
- [ ] Push to GitHub
- [ ] Connect project to Vercel
- [ ] Add environment variables in Vercel dashboard
- [ ] Redeploy after adding environment variables
- [ ] Update Cognito redirect URIs to Vercel domain
- [ ] Update API URLs in `website.html`
- [ ] Test summoner search
- [ ] Test authentication flow

## Vercel Docs Reference

- **Deploying Express**: https://vercel.com/docs/concepts/functions/serverless-functions
- **Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
- **Routing**: https://vercel.com/docs/concepts/projects/projects-faq#using-public-folders

---

**After Deployment**: Your app is now fully deployed on Vercel with both frontend and backend served from the same domain! Continue with AWS Cognito setup using COGNITO_QUICKSTART.md.

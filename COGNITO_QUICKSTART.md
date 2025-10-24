# AWS Cognito Quick Start - Copy/Paste Guide

## Step 1: Create User Pool via AWS Console

**Do this manually in the AWS Console:**
1. Go to https://us-east-1.console.aws.amazon.com/cognito/home
2. Click "Create user pool"
3. **Pool name**: `yordlepedia-pool`
4. **Cognito provider settings**:
   - Sign-in options: Email only
5. Click through and create the pool

## Step 2: Save Your User Pool ID

After creating, you should see your User Pool ID. Save it:
```
User Pool ID: us-east-1_XXXXXXXXX

us-east-1_AQR1MUiM7
```

## Step 3: Create App Client

**In your user pool:**
1. Go to **App integration** → **App clients**
2. Click **Create app client**
3. **App client name**: `yordlepedia-web`
4. **General settings**:
   - Authentication flows: Authorization code grant ✓
5. **App client secret settings**:
   - ✅ **Generate a client secret** (checkbox - make sure it's checked)
6. **Allowed OAuth Scopes**:
   - openid ✓
   - profile ✓
   - email ✓
7. **Allowed redirect URIs** (add both):
   - `http://localhost:3000/auth/callback` (local development)
   - `https://yordlepedia-gg.vercel.app/auth/callback` (production)
8. Click **Create app client**

### ⚠️ IMPORTANT: Save Your Client Secret Now!

After clicking "Create app client", you'll see a confirmation page with:
- **Client ID** - visible anytime

- **Client secret** - click **"Reveal"** or **"Show Details"** button to see it


**⚠️ THIS IS THE ONLY TIME YOU'LL SEE IT** - Copy it immediately and save it!

If you don't see the Client Secret:
1. Go back to **App clients** list
2. Click your app client name (`yordlepedia-web`)
3. Look for "App client information" section
4. Click **"Show Details"** → Client Secret appears
5. If still not there, click **"Generate new client secret"**

**Save:**
```
Client ID: 7oigkkeplthcrdrrfetdam3u5s
Client Secret: 1hqcio8t2ve55bcpa107mhm4mk1ssd2d2ntsk11f4qnptesnh807
```

## Step 4: Create Cognito Domain (Easiest Way - No Certificate Needed)

**In your user pool:**
1. Go to **App integration** → **Domain name**
2. Click **"Create Cognito domain"**
3. Enter a domain prefix (must be globally unique):
   - Example: `yordlepedia-auth` or `yordlepedia-social` or add your name: `ibe-yordlepedia`
   - ✅ **This is the EASIEST approach** - no certificate required
4. Click **"Create Cognito domain"**
5. Wait for it to complete (1-2 minutes)

**Your login page will be:**
```
https://us-east-1aqr1muim7.auth.us-east-1.amazoncognito.com/login
```

**Save:**
```
Cognito Domain: us-east-1aqr1muim7.auth.us-east-1.amazoncognito.com
```

⚠️ **If you get "Domain already exists":**
- Try adding numbers or your name: `yordlepedia-auth-2025` or `ibe-yordlepedia`
- Keep trying until you find one that works

✅ **Why this approach?**
- ✅ No ACM certificate needed
- ✅ HTTPS/SSL automatically included
- ✅ Works immediately
- ✅ Simple setup

## Step 5: Add Riot as Identity Provider

**IMPORTANT**: You need Riot OAuth credentials first!

**Get Riot Credentials:**
1. Go to https://developer.riotgames.com
2. Sign up and request OAuth access
3. WAIT for approval (may take a few days)
4. Get your OAuth credentials

**In Cognito:**
1. Go to **User management** → **Sign-in experience**
2. Click **Identity providers**
3. Click **Add identity provider** → **OpenID Connect**
4. Fill in:
   ```
   Provider name: Riot
   Client ID: [Your Riot Client ID]
   Client secret: [Your Riot Client Secret]
   Authorization endpoint: https://auth.riotgames.com/oauth2/auth
   Token endpoint: https://auth.riotgames.com/oauth2/token
   User info endpoint: https://entitlements.auth.riotgames.com/api/userinfo
   Jwks uri: https://auth.riotgames.com/.well-known/jwks.json
   Request method: POST
   Authorize scopes: openid
   ```
5. Click **Create provider**
6. Click on Riot provider → **Attribute mapping**
7. Map `sub` → `sub`

## Step 6: Update App Client OAuth Settings

**In your user pool:**
1. Go to **App integration** → **App clients**
2. Click your app client name
3. Scroll to **Hosted UI settings**:
   - **Allowed identity providers**: Select "Riot" ✓
   - **Allowed sign-out URIs** (add both):
     - `http://localhost:3000/auth/logout` (local)
     - `https://yordlepedia-gg.vercel.app/auth/logout` (production)
4. Click **Save changes**

## Step 7: Test the Hosted UI

1. In user pool → **App integration** → **App client settings**
2. Scroll down and click the **Hosted UI login page** link
3. You should see a login button for "Sign in with Riot"
4. Test clicking it

## Step 8: Update Your .env File

Replace the placeholder values with your actual credentials:

```env
# AWS Cognito Configuration
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_AQR1MUiM7
COGNITO_CLIENT_ID=7oigkkeplthcrdrrfetdam3u5s
COGNITO_CLIENT_SECRET=1hqcio8t2ve55bcpa107mhm4mk1ssd2d2ntsk11f4qnptesnh807
COGNITO_DOMAIN=us-east-1aqr1muim7.auth.us-east-1.amazoncognito.com

# Riot OAuth Configuration  
RIOT_CLIENT_ID=xxxxxxxxxxxxx
RIOT_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Auth Redirect URIs (use based on environment)
# Local Development
AUTH_REDIRECT_URI=http://localhost:3000/auth/callback
AUTH_LOGOUT_URI=http://localhost:3000/auth/logout

# Production (Vercel)
# AUTH_REDIRECT_URI=https://yordlepedia-gg.vercel.app/auth/callback
# AUTH_LOGOUT_URI=https://yordlepedia-gg.vercel.app/auth/logout
```

**Note**: In production, your server will need to detect the environment and use the correct URIs automatically.

## Step 9: Verify Everything is Connected

Once you have all credentials, test the flow:

1. Start your server:
   ```bash
   npm start
   ```

2. Open browser and go to: `http://localhost:3000/auth/login`

3. You should be redirected to Cognito Hosted UI

4. Click "Sign in with Riot"

5. You should be redirected to Riot OAuth login

6. After logging in, should return to your app

## Common Issues

### "Provider configuration incomplete"
- Make sure Riot credentials are correct
- Check endpoints are exactly correct (copy/paste from this guide)

### "Redirect URI mismatch"  
- Check if you used `http://` vs `https://`
- Must match exactly what you put in Cognito app client

### "Can't find Riot provider"
- Make sure you updated the App Client OAuth Settings (Step 6)
- Riot provider must be selected in "Allowed identity providers"

### Riot login returns error
- Check you actually got approved for OAuth access
- Verify Riot Client ID and Secret are correct

## Quick Reference URLs

```
Your Cognito Console: 
https://console.aws.amazon.com/cognito/users/

Hosted UI Login (Local):
http://localhost:3000/auth/login

Hosted UI Login (Production - Vercel):
https://yordlepedia-gg.vercel.app/auth/login

Cognito Hosted Login Page:
https://us-east-1aqr1muim7.auth.us-east-1.amazoncognito.com/login

Riot Developer Portal:
https://developer.riotgames.com/
```

## Test Credentials Format

If you need to store test values before getting real ones:

```env
COGNITO_USER_POOL_ID=us-east-1_EXAMPLE123
COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j1k2l
COGNITO_CLIENT_SECRET=fake_secret_for_testing_12345678901234567890
COGNITO_DOMAIN=test-domain.auth.us-east-1.amazoncognito.com
RIOT_CLIENT_ID=fake_riot_client_id_12345
RIOT_CLIENT_SECRET=fake_riot_secret_12345
```

Replace with real values once you get them from AWS and Riot.

## You're Ready For Next Steps!

Once this is complete, the next phase is implementing:
1. `/auth/login` endpoint (redirects to Cognito)
2. `/auth/callback` endpoint (handles OAuth response)
3. `/auth/logout` endpoint (signs out)
4. User creation in PostgreSQL
5. Session management

See `BACKEND_AUTH.md` for implementation guide (we'll create this next).

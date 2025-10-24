# AWS Cognito Setup Guide for Yordlepedia.gg

## Step 1: Create AWS Account and Access Cognito

1. Go to https://aws.amazon.com
2. Sign in or create an account
3. Search for "Cognito" in the AWS console
4. Click "User Pools" in the left sidebar
5. Click "Create user pool"

## Step 2: Create User Pool

### Basic Configuration
- **Pool name**: `yordlepedia-pool`
- **User sign-up options**: Select "Email only"
- Click "Next"

### Configure Sign-In Experience
- Keep defaults or customize MFA if desired
- Click "Next"

### Configure Security Requirements
- **Password policy**: Use recommended
- **Account takeover protection**: Enable if desired
- Click "Next"

### Configure Sign-Up Experience
- **Self-service sign-up**: Disable (we want OAuth only)
- **Cognito-assisted sign-up**: Disable
- Click "Next"

### Configure Message Delivery
- **Email**: Use Cognito default (recommended for testing)
- Click "Next"

### Integrate Your App
- **App name**: `yordlepedia-app`
- **Public client**: NOT SELECTED (we need client secret)
- Click "Next" → "Create user pool"

**Save your User Pool ID** (format: `us-east-1_xxxxxxxxx`)

us-east-1_AQR1MUiM7

## Step 3: Create App Client

1. In your user pool, go to **App integration** → **App clients and analytics**
2. Click **Create app client**
3. Fill in:
   - **App type**: Confidential client
   - **App client name**: `yordlepedia-web`
   - **Client secret settings**: Generate a client secret
   - **Authentication flows**: 
     - ✓ Authorization code grant
     - ✓ Refresh token based authentication
   - **Allowed OAuth Scopes**: 
     - ✓ openid
     - ✓ profile
     - ✓ email
   - **Allowed redirect URIs**: 
     - `http://localhost:3000/auth/callback` (development)
     - `https://yordlepedia.gg/auth/callback` (production - add later)
4. Click "Create app client"

**Save:**
- Client ID
- Client secret

## Step 4: Configure Cognito Domain (Easiest Approach)

1. Go to **App integration** → **Domain name**
2. Click **Create Cognito domain**
3. Enter a domain prefix (must be globally unique):
   - Example: `yordlepedia-auth` or `ibe-yordlepedia`
   - Keep trying different prefixes if one is taken
4. Click "Create Cognito domain"
5. Wait 1-2 minutes for it to complete

✅ **That's it! No certificate needed.**

**Your login page will be:**
```
https://yordlepedia-auth.auth.us-east-1.amazoncognito.com/login
```

**Save:** Your Cognito domain (format: `yordlepedia-xxxxx.auth.us-east-1.amazoncognito.com`)

## Step 5: Add Riot as Identity Provider

### Prerequisites
You need your Riot OAuth credentials first. Go to https://developer.riotgames.com and:
1. Register for a developer account
2. Request OAuth access (may take a few days)
3. Once approved, get:
   - OAuth Client ID
   - OAuth Client Secret

### Add Identity Provider in Cognito
1. In your user pool, go to **User management** → **Sign-in experience** → **Identity providers**
2. Click **Add identity provider** → **OpenID Connect**
3. Fill in:
   - **Provider name**: `Riot`
   - **Client ID**: Your Riot OAuth Client ID
   - **Client secret**: Your Riot OAuth Client Secret
   - **Authorization endpoint**: `https://auth.riotgames.com/oauth2/auth`
   - **Token endpoint**: `https://auth.riotgames.com/oauth2/token`
   - **User info endpoint**: `https://entitlements.auth.riotgames.com/api/userinfo`
   - **Jwks uri**: `https://auth.riotgames.com/.well-known/jwks.json`
   - **Request method**: POST
4. For **Authorize scopes**, enter: `openid`
5. Click **Create provider**

### Map Riot Attributes
1. After creating, click on the Riot provider
2. Go to **Attribute mapping**
3. Map these attributes:
   - `sub` → `sub` (required)
   - `email` → `email` (optional but recommended)
4. Click **Save**

## Step 6: Update App Client OAuth Settings

1. Go to **App integration** → **App client settings** (or your app client)
2. Under **Hosted UI settings**:
   - **Allowed identity providers**: Select "Riot"
   - **Allowed redirect URIs**: (already configured)
   - **Allowed sign-out URIs**: 
     - `http://localhost:3000/auth/logout` (development)
     - `https://yordlepedia.gg/auth/logout` (production)
3. Click **Save changes**

## Step 7: Update .env File

Add these to your `.env` file:

```
# AWS Cognito Configuration
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
COGNITO_CLIENT_ID=your_client_id_here
COGNITO_CLIENT_SECRET=your_client_secret_here
COGNITO_DOMAIN=yordlepedia-xxxxx.auth.us-east-1.amazoncognito.com

# Riot OAuth Configuration
RIOT_CLIENT_ID=your_riot_client_id
RIOT_CLIENT_SECRET=your_riot_client_secret

# Auth Redirect URIs
AUTH_REDIRECT_URI=http://localhost:3000/auth/callback
RIOT_REDIRECT_URI=http://localhost:3000/auth/riot/callback
```

## Step 8: Test Cognito Hosted UI

1. Go to your Cognito user pool
2. Click **App integration** → **App client settings**
3. Scroll down and click the **Hosted UI login page** link
4. You should see a login page with "Sign in with Riot" option
5. Click "Sign in with Riot" to test the flow

If successful, you'll be redirected to Riot's OAuth login, then back to your app.

## Important Notes

### For Production Deployment
1. Update redirect URIs to your production domain
2. Switch from HTTP to HTTPS
3. Request a custom domain (optional but recommended)
4. Enable MFA for admin account
5. Set up email notifications via SES

### Security Best Practices
1. Never expose `COGNITO_CLIENT_SECRET` in frontend code
2. Always use HTTPS in production
3. Implement rate limiting on auth endpoints
4. Use secure cookies (httpOnly, secure, sameSite flags)
5. Validate ID tokens server-side

### Troubleshooting
- **"Invalid client" error**: Check Client ID and Secret match
- **"Redirect URI mismatch"**: Make sure redirect URIs exactly match (including protocol)
- **"Invalid scope"**: Riot OAuth only supports `openid` scope
- **User not getting created**: Check attribute mapping is correct

## Next Steps
After Cognito is set up:
1. Update `server.js` with auth endpoints (`/auth/login`, `/auth/callback`, `/auth/logout`)
2. Implement user creation flow to save Riot profile to PostgreSQL
3. Create frontend login UI
4. Test complete OAuth flow

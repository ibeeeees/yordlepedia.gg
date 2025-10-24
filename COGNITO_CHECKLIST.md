# AWS Cognito Setup Checklist

Copy and paste this into a text file to track your progress:

```
AWS COGNITO SETUP CHECKLIST
===========================

STEP 1: Create Cognito User Pool
[ ] Go to https://aws.amazon.com and sign in
[ ] Navigate to Cognito → User Pools
[ ] Click "Create user pool"
[ ] Name: yordlepedia-pool
[ ] Sign-up options: Email only
[ ] Complete all configuration steps
[ ] Create user pool

STEP 2: Retrieve User Pool Details
[ ] Copy User Pool ID: ___________________________________
    Format: us-east-1_xxxxxxxxx

STEP 3: Create App Client
[ ] In user pool, go to App integration → App clients
[ ] Click "Create app client"
[ ] App name: yordlepedia-web
[ ] App type: Confidential client
[ ] Auth flows: Authorization code grant ✓
[ ] OAuth scopes: openid, profile, email ✓
[ ] Redirect URIs: http://localhost:3000/auth/callback
[ ] Create app client

STEP 4: Save App Client Details
[ ] Copy Client ID: ___________________________________
[ ] Copy Client Secret: ___________________________________

STEP 5: Create Cognito Domain
[ ] Go to App integration → Domain name
[ ] Click "Create Cognito domain"
[ ] Domain name: yordlepedia-<something-unique>
[ ] Create domain
[ ] Copy full domain: ___________________________________
    Format: yordlepedia-xxxxx.auth.us-east-1.amazoncognito.com

STEP 6: Get Riot OAuth Credentials
[ ] Go to https://developer.riotgames.com
[ ] Sign up for developer account
[ ] Request OAuth application access
[ ] WAIT FOR APPROVAL (may take days)
[ ] Copy Riot Client ID: ___________________________________
[ ] Copy Riot Client Secret: ___________________________________

STEP 7: Add Riot as Identity Provider
[ ] In Cognito user pool → User management → Sign-in experience
[ ] Click "Identity providers"
[ ] Click "Add identity provider" → "OpenID Connect"
[ ] Provider name: Riot
[ ] Client ID: <Your Riot Client ID>
[ ] Client secret: <Your Riot Client Secret>
[ ] Authorization endpoint: https://auth.riotgames.com/oauth2/auth
[ ] Token endpoint: https://auth.riotgames.com/oauth2/token
[ ] User info endpoint: https://entitlements.auth.riotgames.com/api/userinfo
[ ] Jwks uri: https://auth.riotgames.com/.well-known/jwks.json
[ ] Request method: POST
[ ] Authorize scopes: openid
[ ] Create provider
[ ] Map Riot attributes (sub → sub)

STEP 8: Update App Client OAuth Settings
[ ] Go to App integration → App client settings
[ ] Allowed identity providers: Riot ✓
[ ] Allowed redirect URIs: http://localhost:3000/auth/callback ✓
[ ] Allowed sign-out URIs: http://localhost:3000/auth/logout
[ ] Save changes

STEP 9: Test Hosted UI
[ ] In user pool → App integration → App client settings
[ ] Click "Hosted UI login page" link
[ ] Verify login page displays "Sign in with Riot"
[ ] Test clicking "Sign in with Riot"
[ ] Verify redirect works

STEP 10: Update .env File
[ ] Add COGNITO_USER_POOL_ID
[ ] Add COGNITO_CLIENT_ID
[ ] Add COGNITO_CLIENT_SECRET
[ ] Add COGNITO_DOMAIN
[ ] Add RIOT_CLIENT_ID
[ ] Add RIOT_CLIENT_SECRET
[ ] Add AUTH_REDIRECT_URI
[ ] Add RIOT_REDIRECT_URI

COMPLETED ✓
```

## Quick Reference

### AWS Console Links (after setup)
- Cognito Home: https://console.aws.amazon.com/cognito/home
- Your User Pool: https://console.aws.amazon.com/cognito/users/
- App Clients: Look for "App integration" → "App clients and analytics"

### Cognito Hosted UI URLs
- Login page: `https://{COGNITO_DOMAIN}/login?client_id={CLIENT_ID}&response_type=code&scope=openid+profile+email&redirect_uri={REDIRECT_URI}`
- Logout: `https://{COGNITO_DOMAIN}/logout?client_id={CLIENT_ID}&logout_uri={LOGOUT_URI}`

### Important Values to Save
```
User Pool ID: us-east-1_xxxxxxxxx
Client ID: xxxxxxxxxxxxxxxxxxx
Client Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Cognito Domain: yordlepedia-xxxxx.auth.us-east-1.amazoncognito.com
Riot Client ID: xxxxxxxxxxxxxxxxxxx
Riot Client Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| "Invalid client" error | Check Client ID/Secret are correct and from same app client |
| Redirect URI mismatch | URIs must match exactly (http vs https, trailing slashes) |
| Can't find app client | Make sure you're in the right user pool |
| Riot provider not appearing | Make sure you added identity provider AND updated app client settings |
| Riot login fails | Check Riot credentials are correct and you requested OAuth access |
| Getting 404 when clicking Hosted UI link | Your user pool is in a different region than expected |

## After Setup Complete

You'll be ready to implement:
1. `/auth/login` endpoint → redirects to Cognito Hosted UI
2. `/auth/callback` endpoint → exchanges code for tokens
3. User profile creation/update
4. Session management
5. `/auth/logout` endpoint

See next steps in backend setup guide.

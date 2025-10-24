# AWS Cognito + Riot OAuth Flow Diagram

## Complete Authentication Flow

```
┌─────────────┐                                              ┌──────────────┐
│   Browser   │                                              │  Your Server │
│  (Frontend) │                                              │  (Node.js)   │
└──────┬──────┘                                              └──────┬───────┘
       │                                                             │
       │ 1. User clicks "Sign in with Riot"                         │
       │                                                             │
       ├──────────────────────────────────────────────────────────→ │
       │        GET /auth/login                                    │
       │                                                             │
       │ 2. Server generates auth URL with state param              │
       │                                                             │
       │ ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
       │        Redirect to Cognito Hosted UI                      │
       │                                                             │
       │                 ┌──────────────────┐                      │
       ├────────────────→│ AWS Cognito      │                      │
       │                 │ Hosted UI        │                      │
       │ 3. Shows login  │                  │                      │
       │    page         └──────────────────┘                      │
       │                                                             │
       │ 4. User clicks "Sign in with Riot"                        │
       │                                                             │
       │                 ┌──────────────────┐                      │
       ├────────────────→│ Riot OAuth       │                      │
       │                 │ auth.riot...     │                      │
       │                 └──────────────────┘                      │
       │                                                             │
       │ 5. User logs in with Riot credentials                     │
       │    (Riot server redirects back)                           │
       │                                                             │
       │ ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
       │        Redirect to /auth/callback                         │
       │        (with authorization code)                          │
       │                                                             │
       ├──────────────────────────────────────────────────────────→ │
       │        GET /auth/callback?code=xxx&state=yyy             │
       │                                                             │
       │ 6. Server exchanges code for tokens                       │
       │                                                             │
       │    ┌─────────────────────────────────────┐               │
       │    │ POST to Cognito /oauth2/token       │               │
       │    │ - code                              │               │
       │    │ - client_id                         │               │
       │    │ - client_secret                     │               │
       │    └─────────────────────────────────────┘               │
       │                                                             │
       │ 7. Receives ID token and access token                    │
       │                                                             │
       │ 8. Extracts Riot user info from token                    │
       │    (PUUID, game name, tag line, email)                   │
       │                                                             │
       │ 9. Creates/updates user in PostgreSQL                    │
       │                                                             │
       │ 10. Sets secure session cookie                           │
       │                                                             │
       │ ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
       │        Set-Cookie: session=xxx                            │
       │        Redirect to /profile                               │
       │                                                             │
       │ 11. User is now logged in!                                │
       │                                                             │
```

## Token Structure

### ID Token (JWT)
```
Header:
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "..."
}

Payload:
{
  "sub": "user-unique-id",
  "email": "user@example.com",
  "email_verified": true,
  "cognito:username": "riot_123456",
  "aud": "client_id",
  "token_use": "id",
  "auth_time": 1234567890,
  "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxx",
  "exp": 1234571490
}

Signature: [encoded signature]
```

### Access Token (JWT)
```
Payload:
{
  "sub": "user-unique-id",
  "token_use": "access",
  "scope": "openid profile email",
  "username": "riot_123456",
  "aud": "client_id",
  "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxx",
  "exp": 1234571490
}
```

## Data Flow in Your App

```
┌────────────────────────────────────────────────────────┐
│              User Completes OAuth                       │
└────────────────────────────┬───────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────┐
        │   ID Token Contains:               │
        │  - sub (unique user ID)            │
        │  - email                           │
        │  - cognito:username                │
        └────────────────────────┬───────────┘
                                 │
                                 ▼
        ┌────────────────────────────────────┐
        │   Decode JWT (verify signature)    │
        └────────────────────────┬───────────┘
                                 │
                                 ▼
        ┌────────────────────────────────────┐
        │  Get Riot User Info from Token     │
        │  - PUUID (if available)            │
        │  - Game Name                       │
        │  - Tag Line                        │
        └────────────────────────┬───────────┘
                                 │
                                 ▼
        ┌────────────────────────────────────┐
        │   Create/Update User in DB         │
        │   INSERT INTO users (               │
        │     cognito_id, riot_puuid,        │
        │     gameName, tagLine, email       │
        │   )                                │
        └────────────────────────┬───────────┘
                                 │
                                 ▼
        ┌────────────────────────────────────┐
        │   Store Session/JWT in Cookie      │
        │   (Set-Cookie: session=...)        │
        └────────────────────────┬───────────┘
                                 │
                                 ▼
        ┌────────────────────────────────────┐
        │   Redirect to Profile Page         │
        │   User sees their data!            │
        └────────────────────────────────────┘
```

## Environment Variables Mapping

```
┌─ AWS Cognito ─────────────────────────────────────┐
│                                                   │
│  COGNITO_DOMAIN                                  │
│  └─→ https://yordlepedia-xxxxx.auth.us-...      │
│                                                   │
│  COGNITO_USER_POOL_ID                           │
│  └─→ us-east-1_xxxxxxxxx                        │
│                                                   │
│  COGNITO_CLIENT_ID                              │
│  └─→ (from App client)                          │
│                                                   │
│  COGNITO_CLIENT_SECRET                          │
│  └─→ (from App client) [KEEP SECRET!]           │
│                                                   │
└───────────────────────────────────────────────────┘

┌─ Riot OAuth ──────────────────────────────────────┐
│                                                   │
│  RIOT_CLIENT_ID                                 │
│  └─→ (from developer.riotgames.com)             │
│                                                   │
│  RIOT_CLIENT_SECRET                             │
│  └─→ (from developer.riotgames.com) [KEEP!]    │
│                                                   │
└───────────────────────────────────────────────────┘

┌─ Your App ────────────────────────────────────────┐
│                                                   │
│  AUTH_REDIRECT_URI                              │
│  └─→ http://localhost:3000/auth/callback        │
│                                                   │
│  RIOT_REDIRECT_URI (less commonly used)          │
│  └─→ http://localhost:3000/auth/riot/callback  │
│                                                   │
└───────────────────────────────────────────────────┘
```

## Session Management

```
User Logged In
    │
    ├─→ Request /api/profile
    │       │ Check session cookie
    │       ├─ Valid & not expired → Return profile data
    │       └─ Invalid/expired → Redirect to /auth/login
    │
    ├─→ Request /api/posts/create
    │       │ Check session cookie
    │       ├─ Valid → Create post
    │       └─ Invalid → Return 401 Unauthorized
    │
    └─→ Click "Log Out"
            │ Delete session cookie
            │ Clear local storage
            └─→ Redirect to /auth/logout endpoint
                    │ Sign out from Cognito
                    └─→ Redirect to home page
```

## Security Considerations

```
┌─────────────────────────────────────────────────┐
│ SECURITY CHECKLIST                              │
├─────────────────────────────────────────────────┤
│                                                 │
│ ✓ Client Secret                                │
│   └─ Never expose in frontend code             │
│   └─ Only use on backend                       │
│   └─ Never commit to git                       │
│                                                 │
│ ✓ Redirect URIs                                │
│   └─ Exact match required (http vs https)      │
│   └─ Whitelist all legitimate URIs in Cognito │
│   └─ Prevents token theft via open redirects  │
│                                                 │
│ ✓ Tokens                                       │
│   └─ Store in secure HttpOnly cookies          │
│   └─ Set Secure flag (HTTPS only)              │
│   └─ Set SameSite flag (prevent CSRF)          │
│   └─ Never store in localStorage               │
│                                                 │
│ ✓ State Parameter                              │
│   └─ Prevent CSRF attacks                      │
│   └─ Regenerate for each login attempt        │
│   └─ Validate on callback                      │
│                                                 │
│ ✓ HTTPS                                        │
│   └─ Use in production                         │
│   └─ Certificates from Let's Encrypt           │
│                                                 │
│ ✓ Validation                                   │
│   └─ Verify JWT signature                      │
│   └─ Check token expiration                    │
│   └─ Validate iss, aud, sub claims             │
│                                                 │
└─────────────────────────────────────────────────┘
```

# Riot Sign On (RSO) Setup Guide

## Step 1: Register Your Application with Riot Games

1. **Visit the Riot Developer Portal:**
   - Go to https://developer.riotgames.com/
   - Sign in with your Riot Games account

2. **Create a New Application:**
   - Navigate to "My Applications" or "Apps"
   - Click "Create New App" or similar
   - Choose "Web Application" type

3. **Fill out the Application Details:**
   ```
   Application Name: Yordlepedia.gg
   Description: League of Legends statistics and performance tracking platform
   Website URL: http://localhost:3000 (for development)
   Logo: Upload a 60x60px logo (optional but recommended)
   ```

4. **Configure OAuth2 Settings:**
   ```
   Grant Types: 
   - authorization_code
   - refresh_token
   
   Redirect URIs:
   - http://localhost:3000/oauth2-callback (for development)
   - https://yourdomain.com/oauth2-callback (for production)
   
   Post Logout Redirect URIs:
   - http://localhost:3000/ (for development)
   - https://yourdomain.com/ (for production)
   
   Scopes:
   - openid (required)
   - cpid (to get user's region)
   - offline_access (for refresh tokens)
   ```

5. **Additional Required Information:**
   ```
   Contact Email: your-email@example.com
   Privacy Policy URL: http://localhost:3000/privacy
   Terms of Service URL: http://localhost:3000/tos
   Token Endpoint Auth Method: client_secret_basic
   ```

## Step 2: Get Your Credentials

After approval, you'll receive:
- **Client ID**: A public identifier for your app
- **Client Secret**: A private key (keep this secret!)

## Step 3: Update Your .env File

Add these lines to your `.env` file:

```env
# Riot Sign On (RSO) Configuration
RSO_CLIENT_ID=your-actual-client-id-here
RSO_CLIENT_SECRET=your-actual-client-secret-here
RSO_REDIRECT_URI=http://localhost:3000/oauth2-callback
RSO_BASE_URL=https://auth.riotgames.com
SESSION_SECRET=generate-a-random-string-here
```

## Step 4: Generate a Session Secret

Run this command to generate a secure session secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Step 5: Test Your Setup

1. Start your server: `npm start`
2. Visit: http://localhost:3000
3. Click "Sign In with Riot"
4. You should be redirected to Riot's login page
5. After login, you'll be redirected back to your app

## Troubleshooting

### Common Issues:

1. **"Invalid redirect_uri"**
   - Make sure the redirect URI in your app matches exactly what's registered
   - Check for trailing slashes or typos

2. **"Invalid client_id"**
   - Verify your CLIENT_ID is correct
   - Make sure there are no extra spaces

3. **"Access denied"**
   - Your app might need approval from Riot Games
   - Check your application status in the developer portal

4. **Session issues**
   - Make sure SESSION_SECRET is set and long enough
   - Clear your browser cookies and try again

### Development vs Production

**Development (localhost):**
- Use `http://localhost:3000/oauth2-callback`
- Riot allows localhost for development

**Production:**
- Must use HTTPS: `https://yourdomain.com/oauth2-callback`
- Update redirect URIs in your Riot app settings
- Update RSO_REDIRECT_URI in your production environment

## Security Best Practices

1. **Never commit secrets to Git:**
   - Keep `.env` in your `.gitignore`
   - Use environment variables in production

2. **Use HTTPS in production:**
   - RSO requires HTTPS for production apps
   - Use a service like Vercel, Netlify, or AWS

3. **Validate state parameter:**
   - Already implemented in the code to prevent CSRF attacks

4. **Store tokens securely:**
   - Currently using server-side sessions (good)
   - Never expose tokens to client-side JavaScript

## Next Steps

1. Register your app with Riot Games
2. Get your CLIENT_ID and CLIENT_SECRET
3. Update your `.env` file
4. Test the authentication flow
5. Deploy to production with HTTPS
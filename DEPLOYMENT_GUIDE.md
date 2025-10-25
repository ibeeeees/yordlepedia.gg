# YordlePedia.gg Deployment Guide

## ✅ Local Development

Your application is already configured to run in both local and Lambda environments!

### Run Locally (Traditional Server)
```bash
# Install dependencies
npm install

# Start local server on port 3000
npm start
# or with auto-reload for development
npm run dev
```

### Run Locally (Serverless Simulation)
```bash
# Start serverless offline on port 3002 (simulates AWS Lambda)
npm run offline
```

## 🚀 AWS Lambda Deployment

### Environment Variables Required
Make sure these are set in your `.env` file and AWS Lambda environment:

```env
RIOT_API_KEY=your_riot_api_key_here
RSO_CLIENT_ID=your_rso_client_id
RSO_CLIENT_SECRET=your_rso_client_secret  
RSO_REDIRECT_URI=https://your-domain.com/oauth2-callback
SESSION_SECRET=your_secure_session_secret
```

### Deploy to AWS Lambda
```bash
# Deploy to development stage
npm run deploy

# Deploy to production stage  
npm run deploy:prod
```

### What's Already Configured

✅ **Server Compatibility**: Server automatically detects Lambda environment
✅ **Session Handling**: Secure cookies in production, regular cookies locally  
✅ **Environment Variables**: All RSO and API configs included in serverless.yml
✅ **Binary Assets**: Images, videos, audio files properly handled
✅ **Static Files**: All frontend assets served correctly
✅ **CORS**: Cross-origin requests properly configured

### Key Features Working in Both Environments

- 🔍 **Riot Games API Integration**: Champion data, match history, leaderboards
- 🔐 **Riot Sign On (RSO) Authentication**: Complete OAuth2 flow
- 📊 **Real-time Statistics**: Performance scores, combat mastery, economy control
- 🏆 **Leaderboards**: Multi-region challenger rankings
- 📱 **Match Details**: Detailed match analysis with all 10 players
- 🎮 **Champion Analytics**: Win rates, build recommendations, performance tips

### Architecture Notes

- **Local**: Traditional Express.js server with file system routing
- **Lambda**: Serverless HTTP handler with same Express app, stateless execution
- **Sessions**: Work for OAuth flow but don't persist between Lambda invocations (as expected)
- **Caching**: In-memory caching works per Lambda container lifecycle
- **Static Assets**: Served directly from Lambda (or better yet, use CloudFront + S3)

### Performance Considerations

- **Cold Starts**: ~2-3 seconds for first request after idle period
- **Memory**: 512MB allocated (can increase if needed)
- **Timeout**: 30 seconds (sufficient for API calls)
- **Caching**: Riot API responses cached for 5 minutes to reduce API calls

### Next Steps for Production

1. **Custom Domain**: Set up CloudFront distribution and custom domain
2. **Environment Variables**: Move sensitive configs to AWS Systems Manager
3. **Database**: Consider DynamoDB for persistent user data if needed
4. **Monitoring**: Set up CloudWatch alerts and X-Ray tracing
5. **CI/CD**: GitHub Actions for automated deployment

Your application is fully ready for both local development and AWS Lambda deployment! 🎉
# AWS Lambda Deployment Guide

## Prerequisites
1. AWS CLI configured with appropriate credentials
2. Serverless Framework installed globally: `npm install -g serverless`

## Environment Variables Setup
Before deploying, make sure to set your environment variables:

```bash
export RIOT_API_KEY=RGAPI-97d889ae-6486-4a41-b22f-ca8cea0c5233
export MATCH_HISTORY_COUNT=10
export MATCH_DETAIL_CONCURRENCY=4
```

## Deployment Commands

### Deploy to AWS Lambda
```bash
# Deploy to development stage
serverless deploy

# Deploy to production stage
serverless deploy --stage prod

# Deploy to specific region
serverless deploy --region us-west-2
```

### Local Testing with Serverless Offline
```bash
# Install serverless-offline plugin
npm install --save-dev serverless-offline

# Run locally (mimics Lambda environment)
serverless offline

# The API will be available at http://localhost:3000
```

## Configuration Options

### Environment Variables in serverless.yml
The following environment variables are automatically passed to Lambda:
- `RIOT_API_KEY` - Your Riot Games API key
- `MATCH_HISTORY_COUNT` - Number of matches to fetch (default: 10)
- `MATCH_DETAIL_CONCURRENCY` - Concurrent match detail requests (default: 4)
- `PREFETCH_SUMMONERS` - Comma-separated list of summoners to prefetch

### Lambda Function Settings
- **Runtime**: Node.js 18.x
- **Timeout**: 30 seconds
- **Memory**: 512 MB
- **Architecture**: x86_64

## API Endpoints
Once deployed, your Lambda function will handle all the same endpoints:
- `GET /api/summoner?region=na1&name=SummonerName`
- `POST /api/summoner/banner`
- `GET /api/matches?region=na1&puuid=PUUID`
- `GET /api/ranked?region=na1&id=ID`
- `GET /api/leaderboard?region=kr`
- `GET /` - Main website
- `GET /privacy` - Privacy policy
- `GET /tos` - Terms of service

## Performance Optimizations for Lambda

### Cold Start Mitigation
- The serverless-http wrapper minimizes cold start time
- Environment variables are loaded once during initialization
- Caching mechanisms help reduce API calls

### Rate Limit Handling
Your API key has the following limits:
- 20 requests every 1 second
- 100 requests every 2 minutes

The application includes built-in caching to respect these limits.

## Monitoring and Logs
- View logs: `serverless logs -f api`
- Monitor performance in AWS CloudWatch
- Set up CloudWatch alarms for error rates and latency

## Cost Estimation
AWS Lambda pricing (us-east-1):
- First 1M requests per month: Free
- $0.20 per 1M requests after that
- $0.0000166667 per GB-second of compute time

For typical usage, this should cost less than $5/month.
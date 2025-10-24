# Yordlepedia.gg - Social League of Legends Statistics Platform

## Architecture Overview

### Pages
- **Home/Demo**: Browse summoner stats (no auth required)
- **User Profile**: Personal profile with banner video, profile pic, bio, followers/following
- **Timeline**: Social feed showing clips and highlights from followed players
- **Discover**: Find and follow other players

### Tech Stack
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Authentication**: AWS Cognito + Riot OAuth
- **Video Storage**: AWS S3
- **Frontend**: Vanilla JavaScript (Twitter-like interface)

## Setup Instructions

### 1. Database Setup

Install PostgreSQL and create the database:

```bash
psql -U postgres
CREATE DATABASE yordlepedia;
\c yordlepedia
\i database.sql
```

### 2. AWS Configuration

#### Create Cognito User Pool
1. Go to AWS Cognito console
2. Create a user pool with these settings:
   - User sign-up options: Email only
   - Add Riot as identity provider:
     - Provider name: Riot
     - Client ID: `your_riot_client_id`
     - Client Secret: `your_riot_client_secret`
     - Authorize scopes: `openid`
     - Authorize endpoint: `https://auth.riotgames.com/oauth2/auth`
     - Token endpoint: `https://auth.riotgames.com/oauth2/token`
     - User info endpoint: `https://entitlements.auth.riotgames.com/api/userinfo`

#### Create Cognito App Client
1. In the user pool, go to App clients
2. Create an app client with:
   - Client ID and Secret
   - Allowed OAuth flows: Authorization code grant
   - Redirect URIs: `http://localhost:3000/auth/callback`
   - Allowed scopes: `openid`, `profile`, `email`

#### Create S3 Bucket
1. Go to AWS S3
2. Create bucket: `yordlepedia-clips`
3. Enable public read access for uploaded videos
4. Create IAM user with S3 permissions

### 3. Riot Developer Portal

1. Register at https://developer.riotgames.com
2. Request OAuth application approval
3. Get your OAuth credentials:
   - Client ID
   - Client Secret
   - Register redirect URI: `http://localhost:3000/auth/riot/callback`

### 4. Environment Setup

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

### 5. Install Dependencies

```bash
npm install pg jsonwebtoken axios dotenv express cors
```

### 6. Start Server

```bash
npm start
```

## API Endpoints

### Authentication
- `GET /auth/login` - Initiate Cognito login
- `GET /auth/callback` - Cognito callback handler
- `GET /auth/logout` - Logout and clear session

### User Profile
- `GET /api/user/:username` - Get user profile
- `PUT /api/user/profile` - Update profile (bio, banner, etc)
- `GET /api/user/:userId/followers` - Get followers
- `GET /api/user/:userId/following` - Get following

### Social
- `POST /api/follow/:userId` - Follow user
- `DELETE /api/follow/:userId` - Unfollow user
- `GET /api/feed` - Get timeline feed

### Posts/Clips
- `POST /api/posts` - Create post with clip
- `GET /api/posts/:userId` - Get user's posts
- `POST /api/posts/:postId/like` - Like post
- `DELETE /api/posts/:postId/like` - Unlike post
- `GET /api/posts/:postId/comments` - Get post comments

## Database Schema

### users
- id, cognito_id, riot_puuid, username, gameName, tagLine
- profile_pic_url, banner_video_url, bio
- follower_count, following_count
- created_at, updated_at

### posts
- id, user_id, clip_url, caption, video_duration
- likes_count, comments_count, views_count
- created_at

### follows
- follower_id, following_id

### likes
- user_id, post_id

### comments
- user_id, post_id, content

## Frontend Pages to Create

### /home (Demo - No Auth Required)
- Summoner search functionality (existing)
- Featured players section

### /profile/:username (Requires Auth)
- Profile header with banner video player
- Profile pic, name, rank, stats
- Following/followers counts with modal lists
- Match history on left
- Stats breakdown on right
- Timeline of user's clips in center

### /timeline (Requires Auth)
- Feed of clips from followed players
- Like, comment, share functionality
- Infinite scroll pagination
- Post creation modal

### /discover (Optional)
- Search players to follow
- Recommended players
- Trending clips

## Next Steps

1. Set up AWS Cognito and get credentials
2. Register Riot OAuth application
3. Update `.env` with credentials
4. Run database setup script
5. Implement authentication endpoints in `server.js`
6. Build frontend profile and timeline pages
7. Implement video upload to S3
8. Deploy to production with proper environment variables

## Security Notes

- Never commit `.env` file (already in `.gitignore`)
- Use HTTPS in production
- Implement rate limiting on API endpoints
- Validate all user inputs server-side
- Use secure session cookies with httpOnly flag
- Implement CSRF protection

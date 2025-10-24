# Yordlepedia.gg

🎮 **Competitive League of Legends analytics platform** with summoner search, detailed statistics, and social features.

## Overview

Yordlepedia.gg is a full-stack web application that provides in-depth League of Legends player statistics, profile analysis, and a growing social platform for connecting with other competitive players.

**Status**: Active Development
- ✅ Summoner search & profile analytics (fully functional)
- 🔄 Social platform with authentication (in development)
- 🔄 In-game overlay (planned - see `overlay` branch)

---

## 🌳 Branches

### `main` (Current Development)
The primary development branch with:
- ✅ **Summoner Search**: Live statistics for any League player
- ✅ **Profile Spotlight**: Dynamic avatar, name, and ranked stats
- ✅ **Match History**: Detailed match analysis with KDA, damage, vision scores
- ✅ **Responsive Design**: Mobile, tablet, and desktop optimized
- 🔄 **Social Platform**: Authentication framework (Cognito + Riot OAuth)
- 🔄 **Database Schema**: PostgreSQL with users, posts, follows, likes tables

### `overlay` (In-Game Overlay)
Desktop application branch featuring:
- 📊 Real-time draft recommendations
- 🎯 In-game overlay with build tips and timers
- 🔗 Matchup notes and counters
- 📈 Post-match breakdowns
- 🖥️ Windows & macOS support

**Branch Status**: Planning Phase

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ and npm
- **PostgreSQL** (for social features)
- **Riot API Key** ([Get one here](https://developer.riotgames.com))
- **AWS Account** (for Cognito authentication)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ibeeeees/yordlepedia.gg.git
   cd yordlepedia.gg
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment variables** (create `.env`):
   ```bash
   cp .env.example .env
   ```
   
   Add your credentials:
   ```env
   # Riot API
   RIOT_API_KEY=your_riot_api_key_here
   
   # AWS Cognito (setup via COGNITO_QUICKSTART.md)
   AWS_REGION=us-east-1
   COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
   COGNITO_CLIENT_ID=xxxxxxxxxxxxx
   COGNITO_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   COGNITO_DOMAIN=yordlepedia-xxxxx.auth.us-east-1.amazoncognito.com
   
   # Riot OAuth (after approval from developer.riotgames.com)
   RIOT_CLIENT_ID=xxxxxxxxxxxxx
   RIOT_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   
   # Database (for social features)
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=yordlepedia
   ```

4. **Setup PostgreSQL database** (if using social features):
   ```bash
   psql -U postgres -d yordlepedia -f database.sql
   ```

5. **Start the server**:
   ```bash
   npm start
   ```
   
   Server runs on `http://localhost:3000`

6. **Search for a summoner**:
   - Default prefetch: `ibes#NA1`
   - Try searching for any summoner name in the search bar

---

## 📚 Features

### Current (✅ Working)

#### Summoner Search & Profile
- Real-time summoner lookup by name
- Live profile data with Riot CDN avatar
- Ranked statistics (tier, LP, wins/losses)
- Win rate calculation
- KDA (Kills/Deaths/Assists) tracking

#### Match History
- Last 20 matches with detailed stats
- KDA breakdown per match
- Damage dealt and taken
- Vision score analysis
- Match type indication (Ranked, Normal, etc.)

#### Statistics Dashboard
- Spotlight stats (Win Rate, KDA, Damage, Vision)
- Dynamic updates based on searched player
- Responsive stat cards with comparison bars
- Real-time data from Riot API

#### Responsive Design
- **Mobile** (320px - 600px): Optimized layout
- **Tablet** (600px - 900px): Mid-range design
- **Desktop** (900px+): Full feature display
- Smooth animations and scroll behavior

### In Development (🔄)

#### Social Platform
- **Authentication**: AWS Cognito + Riot OAuth 2.0
- **User Profiles**: Bio, banner video, follower counts
- **Timeline/Feed**: Share highlights and clips
- **Post Creation**: Upload video clips with captions
- **Follow System**: Follow/unfollow other players
- **Interactions**: Like and comment on posts

#### Database
- PostgreSQL schema with 6 tables:
  - `users` - Account data and profiles
  - `posts` - Video clips and highlights
  - `follows` - Social connections
  - `likes` - Post engagement
  - `comments` - Post discussions

### Planned (🎯)

#### In-Game Overlay (`overlay` branch)
- Real-time champion recommendations
- Item build suggestions with timers
- Enemy team analysis and counters
- Post-match performance breakdown
- Windows & macOS desktop app

---

## 🔐 Authentication Flow

### Current: Summoner Search (No Auth Required)
```
User → Search summoner → Riot API → Display stats
```

### In Development: Social Features (OAuth)
```
User → Click "Sign in with Riot"
  ↓
AWS Cognito Hosted UI
  ↓
Riot OAuth Authorization
  ↓
Create/Update user profile
  ↓
Store session with httpOnly cookies
  ↓
Access to timeline, posts, followers
```

**Setup Guide**: See [COGNITO_QUICKSTART.md](./COGNITO_QUICKSTART.md)

---

## 📁 Project Structure

```
yordlepedia.gg/
├── server.js                 # Express backend (1000+ lines)
├── website.html             # Single-page app frontend
├── auth.js                  # Cognito + Riot OAuth config
├── db.js                    # Database query functions (30+)
├── db-pool.js               # PostgreSQL connection pool
├── database.sql             # Database schema
├── package.json             # Dependencies
├── .env.example             # Environment template
│
├── Documentation/
├── COGNITO_QUICKSTART.md    # AWS Cognito setup (copy/paste)
├── COGNITO_SETUP.md         # Detailed setup guide
├── COGNITO_CHECKLIST.md     # Setup progress tracker
├── OAUTH_FLOW.md            # OAuth architecture & flow
├── SOCIAL_SETUP.md          # Social platform overview
│
└── (Branch-specific files in overlay branch)
```

### Key Files

**server.js** (Express Backend)
- RESTful API endpoints for summoner data
- Caching layer with TTL management
- Riot API integration (Account v1, Summoner v4, League v4, Match v5)
- Authentication endpoints (in progress)

**website.html** (Frontend SPA)
- Single-page application with vanilla JavaScript
- Dynamic profile rendering
- Live stats updates
- Responsive CSS with breakpoints
- Modal components for future features

**auth.js** (Authentication)
- AWS Cognito configuration
- Riot OAuth provider setup
- Token exchange functions
- JWT verification utilities

**db.js** (Database Models)
- 30+ query functions for CRUD operations
- User management (create, read, update)
- Post operations (create, delete, feed)
- Follow/unfollow system
- Like and comment functionality

---

## 🔌 API Endpoints

### Public Endpoints (No Auth Required)

#### Get Summoner Stats
```bash
GET /api/summoner/:summonerName
```

**Example**:
```bash
curl http://localhost:3000/api/summoner/ibes%23NA1
```

**Response**:
```json
{
  "name": "ibes#NA1",
  "profileIconId": 4569,
  "summonerLevel": 150,
  "tier": "Platinum",
  "rank": "II",
  "leaguePoints": 87,
  "wins": 145,
  "losses": 132,
  "averageKDA": 3.42,
  "winRate": 52,
  "totalDamageDealt": 450000,
  "visionScore": 25.5
}
```

### Protected Endpoints (Auth Required - In Development)

#### Authentication
```
POST /auth/login          - Redirect to Cognito login
POST /auth/callback       - Handle OAuth response
POST /auth/logout         - Sign out user
```

#### User Profile
```
GET /api/user/profile     - Get current user profile
PUT /api/user/profile     - Update user profile
```

#### Timeline/Posts
```
GET /api/feed             - Get user's personalized feed
POST /api/posts           - Create new post
GET /api/posts/:postId    - Get single post
DELETE /api/posts/:postId - Delete post
```

#### Social
```
POST /api/follow/:userId    - Follow user
DELETE /api/follow/:userId  - Unfollow user
GET /api/followers          - Get user's followers
GET /api/following          - Get users you follow
POST /api/posts/:id/like    - Like a post
DELETE /api/posts/:id/like  - Unlike a post
```

---

## 🛠️ Development

### Add Summoner to Prefetch Cache
Edit `server.js` and add to the prefetch array:
```javascript
const prefetch = ['ibes#NA1', 'Faker#KR1'];
```

### Enable Debug Logging
```bash
DEBUG=* npm start
```

### Run Tests
```bash
npm test
```

### Database Operations

**Create database**:
```bash
createdb yordlepedia
```

**Apply schema**:
```bash
psql -U postgres -d yordlepedia -f database.sql
```

**Connect to database**:
```bash
psql -U postgres -d yordlepedia
```

---

## 📋 Setup Guides

### For Social Features (AWS Cognito)

Follow these in order:

1. **[COGNITO_QUICKSTART.md](./COGNITO_QUICKSTART.md)** - Copy/paste setup (15 min)
2. **[COGNITO_CHECKLIST.md](./COGNITO_CHECKLIST.md)** - Track your progress
3. **[COGNITO_SETUP.md](./COGNITO_SETUP.md)** - Detailed explanations
4. **[OAUTH_FLOW.md](./OAUTH_FLOW.md)** - Understand the architecture

### For In-Game Overlay

See `overlay` branch:
```bash
git checkout overlay
```

---

## 🚦 Status & Roadmap

### Phase 1: Summoner Search ✅ COMPLETE
- [x] Summoner profile lookup
- [x] Match history retrieval
- [x] Statistics calculation
- [x] Avatar display
- [x] Responsive design

### Phase 2: Social Platform 🔄 IN PROGRESS
- [ ] AWS Cognito setup
- [ ] Riot OAuth authentication
- [ ] User registration/login flow
- [ ] User profile page
- [ ] Timeline/feed view
- [ ] Post creation with video upload
- [ ] Follow/unfollow system
- [ ] Like/comment functionality

### Phase 3: In-Game Overlay 🎯 PLANNED
- [ ] Desktop app scaffolding
- [ ] Real-time data streaming
- [ ] Champion recommendations
- [ ] Item build suggestions
- [ ] Matchup analysis
- [ ] Post-match reports

### Phase 4: Advanced Features 🎯 PLANNED
- [ ] Champion mastery tracking
- [ ] Role-specific statistics
- [ ] Seasonal history
- [ ] Replay analysis
- [ ] Tournament tracking
- [ ] Coaching tools

---

## 🐛 Troubleshooting

### "Summoner not found"
- Check spelling (case-insensitive)
- Use format: `SummonerName#Region` (e.g., `ibes#NA1`)
- Summoner may need to play a ranked game first

### "Riot API Error 403"
- Verify your API key is valid
- Check API key has correct permissions
- Wait for rate limiting to reset (120 requests/2 min)

### "Cannot connect to database"
- Ensure PostgreSQL is running: `brew services start postgresql`
- Verify DB credentials in `.env`
- Create database: `createdb yordlepedia`

### "Cognito redirect error"
- Ensure redirect URI exactly matches your `.env` file
- Check `http://` vs `https://`
- Verify app client is set up correctly (see COGNITO_SETUP.md)

---

## 📖 Architecture

### Tech Stack

**Frontend**:
- Vanilla JavaScript (no frameworks)
- HTML5 & CSS3
- Responsive design with mobile-first approach
- Fetch API for async requests

**Backend**:
- Node.js + Express.js 4.19.2
- PostgreSQL for data persistence
- In-memory caching with TTL
- JWT token validation (planned)

**Authentication**:
- AWS Cognito (user pools)
- Riot OAuth 2.0 (identity provider)
- OpenID Connect (protocol)

**External APIs**:
- Riot Games API (summoner data, matches, stats)
- AWS services (Cognito, S3, RDS)

**Infrastructure**:
- Development: Local PostgreSQL
- Production: AWS (Cognito, S3, RDS, CloudFront)

### Data Flow

```
User Input
    ↓
Front-end (website.html) - JavaScript
    ↓
Express Backend (server.js)
    ↓
Cache Layer (if available)
    ↓
Riot API (external) or PostgreSQL (local)
    ↓
Response back to front-end
    ↓
DOM Update (instant re-render)
```

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit changes (`git commit -m 'Add YourFeature'`)
4. Push to branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📝 License

MIT License - see [LICENSE](./LICENSE) file

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ibeeeees/yordlepedia.gg/issues)
- **Riot API Docs**: https://developer.riotgames.com/docs/lol
- **AWS Cognito Docs**: https://docs.aws.amazon.com/cognito/

---

## 🎯 Next Steps

### If you want to...

**Just explore summoner stats**:
1. Run `npm start`
2. Open `http://localhost:3000`
3. Search for any summoner

**Build social features**:
1. Follow [COGNITO_QUICKSTART.md](./COGNITO_QUICKSTART.md)
2. Get Riot OAuth approved
3. Implement backend endpoints (see `server.js`)

**Work on in-game overlay**:
1. Checkout `overlay` branch
2. Review overlay feature spec
3. Set up Electron or similar

---

## 🎉 Features Showcase

### Summoner Search
```
Search any League of Legends player by name
View real-time ranked statistics
See last 20 matches with detailed breakdowns
Track KDA, damage, vision score, and more
Mobile-responsive interface
```

### Profile Spotlight
```
Live player avatar from Riot CDN
Current rank and LP status
Win rate percentage
Average KDA
Total damage per game
Vision score tracking
```

### Social Platform (In Development)
```
Sign in with Riot account via AWS Cognito
Create user profile with custom bio
Upload and share highlight clips
Follow other competitive players
Like and comment on clips
Personalized feed from followed players
```

---

**Last Updated**: October 24, 2025
**Status**: Active Development
**Current Version**: 1.0.0-beta

Made with ❤️ for League of Legends players
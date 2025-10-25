// Vercel Serverless Function - Express API
// Production: Using AWS Hackathon Approved API Key
"use strict";

const path = require("path");
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const RIOT_API_KEY = (process.env.RIOT_API_KEY || "").trim();

console.log(`[Init] API Key loaded: ${RIOT_API_KEY ? RIOT_API_KEY.substring(0, 20) + "..." : "NOT SET"}`);

// Middleware setup
app.use(express.json());
app.use(cors());

// Disable caching for Vercel serverless functions
// Force dynamic responses, don't cache at build time
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// Cache utilities
function createTimedCache(ttlMs) {
    const cache = new Map();
    return {
        get(key) {
            const item = cache.get(key);
            if (!item) return null;
            if (Date.now() > item.expiry) {
                cache.delete(key);
                return null;
            }
            return structuredClone(item.value);
        },
        set(key, value) {
            cache.set(key, {
                value: structuredClone(value),
                expiry: Date.now() + ttlMs
            });
        },
        delete(key) {
            cache.delete(key);
        }
    };
}

// Cache setup with different TTLs
const minutes = (m) => m * 60 * 1000;
const responseCache = createTimedCache(minutes(5));
const summonerCache = createTimedCache(minutes(15));
const rankedCache = createTimedCache(minutes(10));
const matchIdsCache = createTimedCache(minutes(10));
const matchDetailCache = createTimedCache(minutes(60));

const regionToCluster = {
    br1: "americas",
    eun1: "europe",
    euw1: "europe",
    jp1: "asia",
    kr: "asia",
    la1: "americas",
    la2: "americas",
    na1: "americas",
    oc1: "sea",
    tr1: "europe",
    ru: "europe",
    ph2: "sea",
    sg2: "sea",
    th2: "sea",
    tw2: "sea",
    vn2: "sea"
};

const queueMap = {
    420: { key: "RANKED_SOLO", label: "Ranked Solo" },
    440: { key: "RANKED_FLEX", label: "Ranked Flex" },
    450: { key: "ARAM", label: "ARAM" }
};

// Health check endpoint
app.get("/api/health", (req, res) => {
    return res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        hasApiKey: !!RIOT_API_KEY,
        apiKeyPrefix: RIOT_API_KEY ? RIOT_API_KEY.substring(0, 10) + "..." : "NOT SET",
        environment: process.env.NODE_ENV || "development"
    });
});

// Debug endpoint for troubleshooting
app.get("/api/debug", (req, res) => {
    return res.status(200).json({
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        hasRiotApiKey: !!RIOT_API_KEY,
        apiKeyLength: RIOT_API_KEY ? RIOT_API_KEY.length : 0,
        apiKeyPrefix: RIOT_API_KEY ? RIOT_API_KEY.substring(0, 15) + "..." : "NOT_SET",
        regions: Object.keys(regionToCluster),
        clusters: Object.values(regionToCluster).filter((v, i, a) => a.indexOf(v) === i)
    });
});

// Summoner search with query parameters (matches frontend expectations)
app.get("/api/summoner", async (req, res) => {
    const { region, name } = req.query;

    if (!region || !name) {
        return res.status(400).json({ error: "Query parameters 'region' and 'name' are required." });
    }

    try {
        const summonerName = decodeURIComponent(name);
        const cacheKey = `${summonerName}-${region}`;
        
        // Check response cache first
        const cachedResponse = responseCache.get(cacheKey);
        if (cachedResponse) {
            return res.json(cachedResponse);
        }

        if (!RIOT_API_KEY) {
            return res.json({
                profile: { name: summonerName, region, level: 1, profileIconId: 0 },
                matches: { RANKED_SOLO: [], RANKED_FLEX: [], ARAM: [] },
                champions: []
            });
        }

        // Extract game name and tag from format: "name#tag"
        let gameName, tagLine;
        if (summonerName.includes("#")) {
            [gameName, tagLine] = summonerName.split("#");
        } else {
            gameName = summonerName;
            tagLine = ""; // Will fail if tag is required
        }

        // Get the cluster for the region
        const cluster = regionToCluster[region.toLowerCase()] || "americas";

        // Fetch account by riot-id (gameName#tagLine) using correct cluster
        const accountResponse = await axios.get(
            `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
            {
                headers: { "X-Riot-Token": RIOT_API_KEY }
            }
        );

        const { puuid, gameName: accountGameName, tagLine: accountTagLine } = accountResponse.data;

        // Fetch summoner by PUUID using correct region
        const summonerResponse = await axios.get(
            `https://${region.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
            {
                headers: { "X-Riot-Token": RIOT_API_KEY }
            }
        );

        let summonerData = summonerResponse.data;
        
        // Add name from Account API (Summoner v4 doesn't return name)
        summonerData.name = `${accountGameName}#${accountTagLine}`;

        // Fetch ranked stats using correct region
        const rankedResponse = await axios.get(
            `https://${region.toLowerCase()}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}`,
            {
                headers: { "X-Riot-Token": RIOT_API_KEY }
            }
        );

        const rankedStats = rankedResponse.data.find(e => e.queueType === "RANKED_SOLO_5x5") || {};
        
        // Fetch match history using correct cluster
        const matchesResponse = await axios.get(
            `https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`,
            {
                headers: { "X-Riot-Token": RIOT_API_KEY }
            }
        );

        const matchIds = matchesResponse.data;
        const matches = [];

        // Fetch match details (limit to 4 concurrent requests)
        const concurrency = 4;
        for (let i = 0; i < matchIds.length; i += concurrency) {
            const batch = matchIds.slice(i, i + concurrency);
            const batchPromises = batch.map(matchId =>
                axios.get(
                    `https://${cluster}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
                    {
                        headers: { "X-Riot-Token": RIOT_API_KEY }
                    }
                )
            );

            const batchResults = await Promise.all(batchPromises);
            matches.push(...batchResults.map(r => r.data));
        }

        // Enrich data with stats, highlights, etc
        const enrichedData = enrichData(summonerData, rankedStats, matches, puuid);

        // Cache and return
        responseCache.set(cacheKey, enrichedData);
        return res.json(enrichedData);

    } catch (error) {
        const errorData = error.response?.data || error.message;
        const errorStatus = error.response?.status || "unknown";
        console.error(`[Summoner Error] Region: ${region}, Status: ${errorStatus}, Data:`, errorData);
        return res.status(404).json({ 
            error: "Summoner not found",
            details: typeof errorData === 'string' ? errorData : JSON.stringify(errorData),
            status: errorStatus,
            region: region
        });
    }
});

// Video upload endpoint (stub - implement with cloud storage)
app.post("/api/upload/highlight", (req, res) => {
    return res.status(501).json({
        error: "Video upload endpoint not yet implemented.",
        message: "Please use 'Set URL' to provide a direct video link instead."
    });
});

// Fallback payload (demo data)
const fallbackPayload = {
  meta: {
    source: "fallback",
    reason: RIOT_API_KEY ? "Data unavailable, showing demo snapshot." : "Riot API key not configured."
  },
  profile: {
    name: "SummonerName",
    region: "na1",
    regionDisplay: "NA",
    level: 218,
    bannerClip: "https://interactive-examples.mdn.mozilla.org/media/cc0-videos/flower.mp4",
    metaLine: "NA · Level 218 · Top 3.2%",
    headline: "Gold II · 52.3% Winrate",
    rankLabel: "Ranked Solo · Gold II",
    profileIconId: 4569,
  },
  stats: {
    rankedWins: 145,
    rankedLosses: 132,
    summonerLevel: 150,
    tier: "Gold",
    rank: "II",
    leaguePoints: 75,
    winRate: 52,
    averageKDA: 3.42,
    totalDamageDealt: 450000,
    visionScore: 25.5
  }
};

// Main summoner endpoint (legacy - defaults to NA1)
app.get("/api/summoner/:summonerName", async (req, res) => {
    try {
        const summonerName = decodeURIComponent(req.params.summonerName);
        const region = req.query.region || "na1"; // Default to na1 if no region specified
        const cacheKey = `${summonerName}-${region}`;
        
        // Check response cache first
        const cachedResponse = responseCache.get(cacheKey);
        if (cachedResponse) {
            return res.json(cachedResponse);
        }

        if (!RIOT_API_KEY) {
            return res.json(fallbackPayload);
        }

        // Extract game name and tag from format: "name#tag"
        let gameName, tagLine;
        if (summonerName.includes("#")) {
            [gameName, tagLine] = summonerName.split("#");
        } else {
            gameName = summonerName;
            tagLine = ""; // Will fail if tag is required
        }

        // Get the cluster for the region
        const cluster = regionToCluster[region.toLowerCase()] || "americas";

        // Fetch account by riot-id (gameName#tagLine) using correct cluster
        const accountResponse = await axios.get(
            `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
            {
                headers: { "X-Riot-Token": RIOT_API_KEY }
            }
        );

        const { puuid, gameName: accountGameName, tagLine: accountTagLine } = accountResponse.data;

        // Fetch summoner by PUUID using correct region
        const summonerResponse = await axios.get(
            `https://${region.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
            {
                headers: { "X-Riot-Token": RIOT_API_KEY }
            }
        );

        let summonerData = summonerResponse.data;
        
        // Add name from Account API (Summoner v4 doesn't return name)
        summonerData.name = `${accountGameName}#${accountTagLine}`;

        // Fetch ranked stats using correct region
        const rankedResponse = await axios.get(
            `https://${region.toLowerCase()}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}`,
            {
                headers: { "X-Riot-Token": RIOT_API_KEY }
            }
        );

        const rankedStats = rankedResponse.data.find(e => e.queueType === "RANKED_SOLO_5x5") || {};
        
        // Fetch match history using correct cluster
        const matchesResponse = await axios.get(
            `https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`,
            {
                headers: { "X-Riot-Token": RIOT_API_KEY }
            }
        );

        const matchIds = matchesResponse.data;
        const matches = [];

        // Fetch match details (limit to 4 concurrent requests)
        const concurrency = 4;
        for (let i = 0; i < matchIds.length; i += concurrency) {
            const batch = matchIds.slice(i, i + concurrency);
            const batchPromises = batch.map(matchId =>
                axios.get(
                    `https://${cluster}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
                    {
                        headers: { "X-Riot-Token": RIOT_API_KEY }
                    }
                )
            );

            const batchResults = await Promise.all(batchPromises);
            matches.push(...batchResults.map(r => r.data));
        }

        // Enrich data
        const enrichedData = enrichData(summonerData, rankedStats, matches, puuid);

        // Cache and return
        responseCache.set(cacheKey, enrichedData);
        return res.json(enrichedData);

    } catch (error) {
        console.error("Error fetching summoner:", error.message);
        return res.status(500).json({
            error: "Failed to fetch summoner data",
            message: error.message
        });
    }
});

// Enrich data function
function enrichData(summonerData, rankedStats, matches, puuid) {
    const rankedWins = rankedStats.wins || 0;
    const rankedLosses = rankedStats.losses || 0;
    const totalRankedGames = rankedWins + rankedLosses;
    const calculatedWinRate = totalRankedGames > 0 ? Math.round((rankedWins / totalRankedGames) * 100) : 0;

    let totalDamageDealt = 0;
    let totalVisionScore = 0;
    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    let matchCount = 0;

    matches.forEach((match) => {
        const participant = match.info.participants.find(p => p.puuid === puuid);
        if (participant) {
            totalDamageDealt += participant.totalDamageDealt || 0;
            totalVisionScore += participant.visionScore || 0;
            totalKills += participant.kills || 0;
            totalDeaths += participant.deaths || 0;
            totalAssists += participant.assists || 0;
            matchCount++;
        }
    });

    const averageKDA = matchCount > 0 
        ? ((totalKills + totalAssists) / Math.max(totalDeaths, 1)).toFixed(2)
        : 0;

    return {
        profile: {
            name: summonerData.name,
            profileIconId: summonerData.profileIconId,
            summonerLevel: summonerData.summonerLevel,
            tier: rankedStats.tier || "Unranked",
            rank: rankedStats.rank || "",
            leaguePoints: rankedStats.leaguePoints || 0,
            regionDisplay: "NA"
        },
        stats: {
            rankedWins,
            rankedLosses,
            calculatedWinRate,
            winRate: {
                value: `${calculatedWinRate}%`,
                delta: 0
            },
            averageKDA: {
                value: averageKDA,
                delta: 0
            },
            totalDamageDealt: {
                value: Math.round(totalDamageDealt / Math.max(matchCount, 1)),
                delta: 0
            },
            visionScore: {
                value: (totalVisionScore / Math.max(matchCount, 1)).toFixed(1),
                delta: 0
            }
        },
        matches: matches.slice(0, 20).map((match) => {
            const participant = match.info.participants.find(p => p.puuid === puuid);
            return {
                matchId: match.metadata.matchId,
                timestamp: new Date(match.info.gameEndTimestamp).toLocaleString(),
                champion: participant.championName,
                kills: participant.kills,
                deaths: participant.deaths,
                assists: participant.assists,
                damage: participant.totalDamageDealt,
                visionScore: participant.visionScore,
                result: participant.win ? "Win" : "Loss"
            };
        })
    };
}

// Serve static files from parent directory (for Vercel)
app.use(express.static(path.join(__dirname, '..')));

// Legal pages
app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, '../privacy.html'));
});

app.get('/tos', (req, res) => {
    res.sendFile(path.join(__dirname, '../tos.html'));
});

// SPA fallback - serve website.html for any unmatched routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../website.html'));
});

app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../website.html'));
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

// Export for Vercel
module.exports = app;

// Local development
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

"use strict";

require("dotenv").config();
const path = require("path");
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const RIOT_API_KEY = process.env.RIOT_API_KEY || "";

// Middleware setup
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(cors());

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

// Video upload endpoint (stub - implement with cloud storage)
app.post("/api/upload/highlight", (req, res) => {
    return res.status(501).json({
        error: "Video upload endpoint not yet implemented.",
        message: "Please use 'Set URL' to provide a direct video link instead."
    });
});

// Authentication endpoints (currently disabled - implement with auth service of choice)
// Supported options: Auth0, Firebase, Cognito, or custom JWT implementation

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
    roles: ["Mid", "Jungle", "Fill"],
    highlights: [
      "15.4 KDA Syndra carry",
      "18 assists on Thresh",
      "Samira Pentakill last session"
    ],
    stats: {
      seasonWins: { value: "214", subtext: "+12 in the last week" },
      averageKDA: { value: "3.68", subtext: "Across 5 recent ranked games" },
      damageShare: { value: "29%", subtext: "+8% vs role average" },
      visionScore: { value: "32", subtext: "Average per game" }
    }
  },
  matches: {
    RANKED_SOLO: [
      {
        champion: "Ahri",
        role: "Mid",
        kda: "12 / 3 / 9",
        kdaValue: 7,
        result: "win",
        duration: "32m",
        cs: "264 CS",
        kp: "72% KP",
        timeAgo: "2 hours ago",
        queueLabel: "Ranked Solo"
      },
      {
        champion: "Lee Sin",
        role: "Jungle",
        kda: "6 / 5 / 14",
        kdaValue: 4,
        result: "win",
        duration: "28m",
        cs: "194 CS",
        kp: "68% KP",
        timeAgo: "5 hours ago",
        queueLabel: "Ranked Solo"
      },
      {
        champion: "Syndra",
        role: "Mid",
        kda: "3 / 7 / 4",
        kdaValue: 1,
        result: "loss",
        duration: "25m",
        cs: "182 CS",
        kp: "46% KP",
        timeAgo: "8 hours ago",
        queueLabel: "Ranked Solo"
      },
      {
        champion: "Samira",
        role: "ADC",
        kda: "18 / 2 / 8",
        kdaValue: 13,
        result: "win",
        duration: "38m",
        cs: "302 CS",
        kp: "64% KP",
        timeAgo: "1 day ago",
        queueLabel: "Ranked Solo"
      },
      {
        champion: "Thresh",
        role: "Support",
        kda: "2 / 1 / 23",
        kdaValue: 25,
        result: "win",
        duration: "30m",
        cs: "24 CS",
        kp: "85% KP",
        timeAgo: "1 day ago",
        queueLabel: "Ranked Solo"
      }
    ],
    RANKED_FLEX: [
      {
        champion: "Lux",
        role: "Support",
        kda: "5 / 2 / 18",
        kdaValue: 11.5,
        result: "win",
        duration: "27m",
        cs: "34 CS",
        kp: "82% KP",
        timeAgo: "3 days ago",
        queueLabel: "Ranked Flex"
      },
      {
        champion: "Ezreal",
        role: "ADC",
        kda: "7 / 6 / 5",
        kdaValue: 2,
        result: "loss",
        duration: "31m",
        cs: "288 CS",
        kp: "59% KP",
        timeAgo: "4 days ago",
        queueLabel: "Ranked Flex"
      }
    ],
    ARAM: [
      {
        champion: "Ziggs",
        role: "Mage",
        kda: "14 / 4 / 24",
        kdaValue: 9.5,
        result: "win",
        duration: "20m",
        cs: "84 CS",
        kp: "78% KP",
        timeAgo: "2 days ago",
        queueLabel: "ARAM"
      },
      {
        champion: "Velkoz",
        role: "Mage",
        kda: "10 / 9 / 19",
        kdaValue: 3.2,
        result: "loss",
        duration: "22m",
        cs: "68 CS",
        kp: "65% KP",
        timeAgo: "2 days ago",
        queueLabel: "ARAM"
      }
    ]
  },
  champions: [
    {
      name: "Ahri",
      role: "Mid",
      winRate: "56.2%",
      kda: "6.1 / 3.2 / 7.8",
      games: 24
    },
    {
      name: "Lee Sin",
      role: "Jungle",
      winRate: "53.4%",
      kda: "4.8 / 4.6 / 8.9",
      games: 18
    },
    {
      name: "Samira",
      role: "ADC",
      winRate: "58.6%",
      kda: "8.9 / 5.1 / 5.6",
      games: 16
    },
    {
      name: "Thresh",
      role: "Support",
      winRate: "54.7%",
      kda: "2.2 / 4.1 / 14.8",
      games: 29
    }
  ]
};

// Stores per-user banner clip by PUUID
const bannerClipStore = new Map();

const MATCH_HISTORY_COUNT = Number(process.env.MATCH_HISTORY_COUNT || 10);
const MATCH_DETAIL_CONCURRENCY = Math.max(1, Number(process.env.MATCH_DETAIL_CONCURRENCY || 4));

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get("/api/summoner", async (req, res) => {
  const { region, name } = req.query;

  if (!region || !name) {
    return res.status(400).json({ error: "Query parameters 'region' and 'name' are required." });
  }

  const normalizedRegion = region.toLowerCase();

  if (!regionToCluster[normalizedRegion]) {
    return res.status(400).json({ error: `Unsupported region "${region}".` });
  }

  if (!RIOT_API_KEY) {
    return res.json(structuredClone(fallbackPayload));
  }

  const inputName = normalizeSummonerName(name);
  const primaryCacheKey = cacheKeyForSummoner(normalizedRegion, inputName);
  const cachedResponse = responseCache.get(primaryCacheKey);

  if (cachedResponse?.payload) {
    return res.json({
      meta: {
        source: "cache",
        cachedAt: new Date(cachedResponse.cachedAt).toISOString()
      },
      ...structuredClone(cachedResponse.payload)
    });
  }

  try {
    const payload = await hydrateSummoner(normalizedRegion, name);
    storeCachedResponse(normalizedRegion, inputName, payload);
    if (payload?.profile?.name) {
      storeCachedResponse(normalizedRegion, payload.profile.name, payload);
    }

    return res.json({
      meta: { source: "riot", retrievedAt: new Date().toISOString() },
      ...structuredClone(payload)
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return res.status(404).json({ error: `Summoner "${name}" not found on ${normalizedRegion.toUpperCase()}.` });
      }
      if (error.response?.status === 429) {
        return res.status(200).json({
          ...structuredClone(fallbackPayload),
          meta: { source: "fallback", reason: "Riot API rate limit reached. Showing demo data instead." }
        });
      }
    }

    console.error("Riot API error:", error);
    return res.status(200).json({
      ...structuredClone(fallbackPayload),
      meta: { source: "fallback", reason: "Unexpected error talking to Riot API. Showing demo data." }
    });
  }
});

// Set or update the highlight banner clip for a summoner
// body: { region: string, name: string, bannerClip: string }
app.post("/api/summoner/banner", async (req, res) => {
  const { region, name, bannerClip } = req.body || {};
  if (!region || !name || !bannerClip) {
    return res.status(400).json({ error: "Missing required fields: region, name, bannerClip" });
  }
  const normalizedRegion = String(region).toLowerCase();
  if (!regionToCluster[normalizedRegion]) {
    return res.status(400).json({ error: `Unsupported region "${region}".` });
  }
  if (!isLikelyUrl(bannerClip)) {
    return res.status(400).json({ error: "bannerClip must be a valid http(s) URL." });
  }
  try {
    // Resolve summoner -> puuid so the clip sticks through name changes
    const summ = await fetchSummonerProfile(normalizedRegion, name);
    if (!summ?.puuid) {
      return res.status(404).json({ error: "Summoner not found." });
    }
    bannerClipStore.set(summ.puuid, String(bannerClip));

    // If we already cached a response for this summoner, update it
    const k1 = cacheKeyForSummoner(normalizedRegion, name);
    const cached = responseCache.get(k1);
    if (cached?.payload?.profile) {
      cached.payload.profile.bannerClip = String(bannerClip);
      storeCachedResponse(normalizedRegion, name, cached.payload);
      if (cached.payload.profile?.name) {
        storeCachedResponse(normalizedRegion, cached.payload.profile.name, cached.payload);
      }
    }
    return res.json({ ok: true, bannerClip: String(bannerClip) });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return res.status(404).json({ error: "Summoner not found." });
    }
    console.error("Set banner error:", error);
    return res.status(500).json({ error: "Failed to set banner." });
  }
});

// Match history endpoint
// Ranked info endpoint
app.get("/api/ranked", async (req, res) => {
    const { region, id } = req.query;

    if (!region || !id) {
        return res.status(400).json({ error: "Query parameters 'region' and 'id' are required." });
    }

    const normalizedRegion = region.toLowerCase();
    if (!regionToCluster[normalizedRegion]) {
        return res.status(400).json({ error: `Unsupported region "${region}".` });
    }

    const cacheKey = `ranked:${normalizedRegion}:${id}`;
    const cached = rankedCache.get(cacheKey);
    if (cached) {
        return res.json({
            meta: { source: "cache" },
            ranked: cached
        });
    }

    try {
        const rankedUrl = `https://${normalizedRegion}.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}`;
        const response = await axios.get(rankedUrl, {
            headers: { "X-Riot-Token": RIOT_API_KEY }
        });

        const rankedData = response.data.map(queue => ({
            queueType: queueMap[queue.queueType === "RANKED_SOLO_5x5" ? 420 : 440].key,
            tier: queue.tier,
            rank: queue.rank,
            leaguePoints: queue.leaguePoints,
            wins: queue.wins,
            losses: queue.losses,
            winRate: Math.round((queue.wins / (queue.wins + queue.losses)) * 100),
            hotStreak: queue.hotStreak
        }));

        rankedCache.set(cacheKey, rankedData);
        res.json({
            meta: { source: "live" },
            ranked: rankedData
        });
    } catch (error) {
        console.error("Ranked info error:", error);
        res.status(500).json({ error: "Failed to fetch ranked information." });
    }
});

// Leaderboard endpoint (returns demo data)
app.get("/api/leaderboard", async (req, res) => {
    try {
        const { region } = req.query;
        const normalizedRegion = (region || "kr").toLowerCase();

        if (!regionToCluster[normalizedRegion]) {
            return res.status(400).json({ error: `Unsupported region "${region}".` });
        }

        // Return mock leaderboard data for now
        const leaderboard = [
            { rank: 1, name: "T1 Faker", lp: 1540, wr: "64%", role: "Mid" },
            { rank: 2, name: "Gen G Peyz", lp: 1498, wr: "61%", role: "ADC" },
            { rank: 3, name: "DRX BeryL", lp: 1435, wr: "59%", role: "Support" },
            { rank: 4, name: "DK Canyon", lp: 1386, wr: "57%", role: "Jungle" },
            { rank: 5, name: "T1 Zeus", lp: 1354, wr: "60%", role: "Top" }
        ];

        res.json({
            meta: { source: "fallback", reason: "Leaderboard data coming soon with Riot API v5 integration" },
            leaderboard,
            region: normalizedRegion
        });
    } catch (error) {
        console.error("Leaderboard error:", error);
        res.status(500).json({ error: "Failed to fetch leaderboard data." });
    }
});

app.get("/api/matches", async (req, res) => {
    const { region, puuid } = req.query;

    if (!region || !puuid) {
        return res.status(400).json({ error: "Query parameters 'region' and 'puuid' are required." });
    }

    const normalizedRegion = region.toLowerCase();
    const cluster = regionToCluster[normalizedRegion];
    if (!cluster) {
        return res.status(400).json({ error: `Unsupported region "${region}".` });
    }

    const cacheKey = `matches:${cluster}:${puuid}`;
    const cached = matchIdsCache.get(cacheKey);
    if (cached) {
        return res.json({
            meta: { source: "cache" },
            matches: cached
        });
    }

    try {
        const matchListUrl = `https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`;
        const response = await axios.get(matchListUrl, {
            params: { count: 20 },
            headers: { "X-Riot-Token": RIOT_API_KEY }
        });

        matchIdsCache.set(cacheKey, response.data);

        // Fetch match details for each match
        const matchDetails = await Promise.all(
            response.data.slice(0, 5).map(async (matchId) => {
                const matchCacheKey = `match:${matchId}`;
                const cachedMatch = matchDetailCache.get(matchCacheKey);
                if (cachedMatch) return cachedMatch;

                try {
                    const matchUrl = `https://${cluster}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
                    const matchResponse = await axios.get(matchUrl, {
                        headers: { "X-Riot-Token": RIOT_API_KEY }
                    });

                    const match = matchResponse.data;
                    const participant = match.info.participants.find(p => p.puuid === puuid);
                    
                    if (!participant) {
                        console.warn(`Player ${puuid} not found in match ${matchId}`);
                        return null;
                    }

                    const matchData = {
                        id: matchId,
                        gameMode: queueMap[match.info.queueId]?.key || "OTHER",
                        champion: participant.championName,
                        role: participant.teamPosition || "FILL",
                        duration: Math.floor(match.info.gameDuration / 60) + "m",
                        result: participant.win ? "win" : "loss",
                        kills: participant.kills,
                        deaths: participant.deaths,
                        assists: participant.assists,
                        kda: `${participant.kills}/${participant.deaths}/${participant.assists}`,
                        kdaValue: participant.deaths === 0 ? participant.kills + participant.assists : ((participant.kills + participant.assists) / participant.deaths).toFixed(1),
                        cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
                        csPerMin: ((participant.totalMinionsKilled + participant.neutralMinionsKilled) / (match.info.gameDuration / 60)).toFixed(1),
                        kp: Math.round(((participant.kills + participant.assists) / match.info.teams.find(t => t.teamId === participant.teamId).objectives.champion.kills) * 100)
                    };

                    matchDetailCache.set(matchCacheKey, matchData);
                    return matchData;
                } catch (error) {
                    console.error(`Error fetching match ${matchId}:`, error);
                    return null;
                }
            })
        );

        const validMatches = matchDetails.filter(m => m !== null);
        res.json({
            meta: { source: "live" },
            matches: validMatches
        });
    } catch (error) {
        console.error("Match history error:", error);
        res.status(500).json({ error: "Failed to fetch match history." });
    }
});

// Legal pages
app.get("/privacy", (req, res) => {
    res.sendFile(path.join(__dirname, "privacy.html"));
});

app.get("/tos", (req, res) => {
    res.sendFile(path.join(__dirname, "tos.html"));
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "website.html"));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    if (!RIOT_API_KEY) {
        console.warn("⚠️  RIOT_API_KEY not configured. Server will return demo data only.");
    } else {
        const keyPreview = `${RIOT_API_KEY.substring(0, 10)}...${RIOT_API_KEY.substring(RIOT_API_KEY.length - 5)}`;
        console.log(`✓ RIOT_API_KEY configured: ${keyPreview}`);
        // Prefetch configured summoners
        prefetchConfiguredSummoners().catch(err => {
            console.error("Error during prefetch:", err?.message || err);
        });
    }
});

async function fetchSummonerProfile(region, summonerName) {
  const normalizedName = normalizeSummonerName(summonerName);
  const cacheKey = `summoner:${region}:${normalizedName}`;
  const cached = summonerCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Parse gameName#tagLine format (e.g., "ibes#na1")
  let gameName, tagLine;
  if (summonerName.includes("#")) {
    [gameName, tagLine] = summonerName.split("#");
  } else {
    gameName = summonerName;
    tagLine = region.toUpperCase(); // Use region as tagLine
  }
  
  try {
    // Get Account info using Account API v1 (by-riot-id)
    const accountUrl = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    console.log(`[Summoner] Fetching account: ${gameName}#${tagLine}`);
    const accountResponse = await axios.get(accountUrl, riotConfig());
    const { puuid, gameName: accountGameName, tagLine: accountTagLine } = accountResponse.data;
    
    // Get Summoner info using the PUUID (v4 endpoint which you have)
    const summonerUrl = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`;
    const summonerResponse = await axios.get(summonerUrl, riotConfig());
    const data = summonerResponse.data;
    
    // Add the name from Account API since Summoner v4 doesn't include it
    data.name = `${accountGameName}#${accountTagLine}`;
    
    if (data?.name) {
      summonerCache.set(cacheKeyForSummoner(region, data.name), data);
    }
    summonerCache.set(cacheKey, data);
    return structuredClone(data);
  } catch (error) {
    console.error(`[API Error] Summoner Profile: ${error.response?.status || error.code}`);
    console.error(`[API Error] GameName#TagLine: ${gameName}#${tagLine}`);
    console.error(`[API Error] Message: ${error.message}`);
    throw error;
  }
}

async function fetchRankedStats(region, summonerId, puuid) {
  const cacheKey = `ranked:${region}:${puuid || summonerId}`;
  const cached = rankedCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Use by-puuid endpoint if available, otherwise use by-summoner
    const endpoint = puuid 
      ? `https://${region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`
      : `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`;
    
    console.log(`[Ranked] Fetching from: ${endpoint.split('/').slice(-1)[0]}`);
    const response = await axios.get(endpoint, riotConfig());
    const data = response.data || [];
    rankedCache.set(cacheKey, data);
    return structuredClone(data);
  } catch (error) {
    console.warn(`[Ranked Stats Error]: ${error.message}`);
    // Return empty array if we can't fetch ranked stats
    return [];
  }
}

async function fetchMatches(region, puuid) {
  const routing = regionToCluster[region];
  const matchIds = await fetchMatchIds(routing, puuid);
  const matches = [];

  for (let index = 0; index < matchIds.length; index += MATCH_DETAIL_CONCURRENCY) {
    const slice = matchIds.slice(index, index + MATCH_DETAIL_CONCURRENCY);
    const chunk = await Promise.all(
      slice.map(matchId => fetchMatchDetail(routing, matchId))
    );
    matches.push(...chunk.filter(Boolean));
  }

  return matches;
}

async function hydrateSummoner(region, summonerName) {
  try {
    console.log(`[Prefetch] Fetching summoner profile: ${summonerName} (${region})`);
    const profile = await fetchSummonerProfile(region, summonerName);
    console.log(`[Prefetch] Fetching ranked stats for PUUID: ${profile.puuid}`);
    const rankedStats = await fetchRankedStats(region, profile.id, profile.puuid);
    console.log(`[Prefetch] Fetching matches for PUUID: ${profile.puuid}`);
    const matches = await fetchMatches(region, profile.puuid);
    console.log(`[Prefetch] Enriching data...`);
    const payload = enrichData(profile, rankedStats, matches, region);
    const clip = bannerClipStore.get(profile.puuid);
    if (clip) {
      payload.profile.bannerClip = clip;
    }
    return payload;
  } catch (error) {
    console.error(`[Prefetch] Error in hydrateSummoner:`, error.config?.url || error.message);
    throw error;
  }
}

async function fetchMatchIds(routing, puuid) {
  const cacheKey = `matchIds:${routing}:${puuid}`;
  const cached = matchIdsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await axios.get(
    `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`,
    { ...riotConfig(), params: { start: 0, count: MATCH_HISTORY_COUNT } }
  );

  const ids = response.data || [];
  matchIdsCache.set(cacheKey, ids);
  return ids;
}

async function fetchMatchDetail(routing, matchId) {
  const cacheKey = `match:${matchId}`;
  const cached = matchDetailCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(
      `https://${routing}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      riotConfig()
    );
    const data = response.data;
    matchDetailCache.set(cacheKey, data);
    return structuredClone(data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

function storeCachedResponse(region, name, payload) {
  const normalizedName = normalizeSummonerName(name);
  const key = cacheKeyForSummoner(region, normalizedName);
  responseCache.set(key, {
    cachedAt: Date.now(),
    payload
  });
}


function normalizeSummonerName(name = "") {
  return name.trim().toLowerCase();
}

function cacheKeyForSummoner(region, name) {
  return `summoner:${region}:${normalizeSummonerName(name)}`;
}



function isLikelyUrl(url) {
  try {
    const u = new URL(String(url));
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (_) {
    return false;
  }
}

async function prefetchConfiguredSummoners() {
  if (!RIOT_API_KEY) return;
  const config = process.env.PREFETCH_SUMMONERS;
  if (!config) return;

  const entries = config.split(",").map(item => item.trim()).filter(Boolean);
  for (const entry of entries) {
    const [regionPart, ...nameParts] = entry.split(":");
    if (!regionPart || !nameParts.length) continue;

    const region = regionPart.toLowerCase();
    const summonerName = nameParts.join(":").trim();
    if (!regionToCluster[region] || !summonerName) continue;

    try {
      const payload = await hydrateSummoner(region, summonerName);
      storeCachedResponse(region, summonerName, payload);
      if (payload?.profile?.name) {
        storeCachedResponse(region, payload.profile.name, payload);
      }
      console.log(`Prefetched ${payload?.profile?.name || summonerName} (${region.toUpperCase()})`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(`Prefetch skipped: ${summonerName} (${region.toUpperCase()}) not found.`);
        continue;
      }
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        console.warn("Prefetch halted: Riot API rate limit reached.");
        break;
      }
      console.warn(`Prefetch error for ${summonerName} (${region.toUpperCase()}):`, error?.message || error);
    }
  }
}


function enrichData(profile, rankedStats, rawMatches, region) {
  const rankedSolo = rankedStats.find(entry => entry.queueType === "RANKED_SOLO_5x5");
  const rankLabel = rankedSolo
    ? `Ranked Solo · ${titleCase(rankedSolo.tier)} ${rankedSolo.rank}`
    : "Ranked Solo · Unranked";
  const headline = rankedSolo
    ? `${titleCase(rankedSolo.tier)} ${rankedSolo.rank} · ${winRate(rankedSolo.wins, rankedSolo.losses)}% Winrate`
    : "Unranked · Play placements to unlock rank data";

  const matchesByQueue = {
    RANKED_SOLO: [],
    RANKED_FLEX: [],
    ARAM: []
  };

  const aggregation = {
    totalKills: 0,
    totalDeaths: 0,
    totalAssists: 0,
    totalVision: 0,
    damageShares: [],
    roles: new Map(),
    champions: new Map(),
    totalGames: 0,
    totalWins: 0
  };

  for (const match of rawMatches) {
    const queue = queueMap[match.info.queueId];
    if (!queue) continue;

    const participant = match.info.participants.find(p => p.puuid === profile.puuid);
    if (!participant) continue;

    const roleLabel = resolveRole(participant.teamPosition, participant.role);

    const teamParticipants = match.info.participants.filter(p => p.teamId === participant.teamId);
    const teamKills = teamParticipants.reduce((sum, p) => sum + p.kills, 0) || 1;
    const teamDamage = teamParticipants.reduce((sum, p) => sum + p.totalDamageDealtToChampions, 0) || 1;

    const kills = participant.kills;
    const deaths = participant.deaths;
    const assists = participant.assists;
    const cs = (participant.totalMinionsKilled || 0) + (participant.neutralMinionsKilled || 0);
    const kdaValue = (kills + assists) / Math.max(1, deaths);
    const kpValue = Math.round(((kills + assists) / Math.max(1, teamKills)) * 100);
    const damageShare = participant.totalDamageDealtToChampions / teamDamage;
    const durationMinutes = Math.round((match.info.gameDuration || 0) / 60);
    const queueLabel = queue.label;
    const gameTimestamp = match.info.gameEndTimestamp || match.info.gameCreation;

    aggregation.totalKills += kills;
    aggregation.totalDeaths += deaths;
    aggregation.totalAssists += assists;
    aggregation.totalVision += participant.visionScore || 0;
    aggregation.damageShares.push(damageShare);
    aggregation.totalGames += 1;
    aggregation.totalWins += participant.win ? 1 : 0;

    aggregation.roles.set(roleLabel, (aggregation.roles.get(roleLabel) || 0) + 1);

    if (!aggregation.champions.has(participant.championName)) {
      aggregation.champions.set(participant.championName, {
        name: participant.championName,
        role: roleLabel,
        games: 0,
        wins: 0,
        kills: 0,
        deaths: 0,
        assists: 0
      });
    }
    const champRef = aggregation.champions.get(participant.championName);
    champRef.games += 1;
    champRef.wins += participant.win ? 1 : 0;
    champRef.kills += kills;
    champRef.deaths += deaths;
    champRef.assists += assists;

    matchesByQueue[queue.key].push({
      champion: participant.championName,
      role: roleLabel,
      kda: `${kills} / ${deaths} / ${assists}`,
      kdaValue: Number(kdaValue.toFixed(2)),
      result: participant.win ? "win" : "loss",
      duration: `${durationMinutes}m`,
      cs: `${cs} CS`,
      kp: `${kpValue}% KP`,
      timeAgo: timeAgo(gameTimestamp),
      queueLabel
    });
  }

  const rolesSorted = [...aggregation.roles.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([role]) => role);

  const championSummaries = [...aggregation.champions.values()]
    .sort((a, b) => b.games - a.games)
    .slice(0, 4)
    .map(champ => {
      const avgKills = champ.kills / champ.games || 0;
      const avgDeaths = champ.deaths / champ.games || 0;
      const avgAssists = champ.assists / champ.games || 0;
      return {
        name: champ.name,
        role: champ.role,
        winRate: `${winRate(champ.wins, champ.games - champ.wins)}%`,
        kda: `${avgKills.toFixed(1)} / ${avgDeaths.toFixed(1)} / ${avgAssists.toFixed(1)}`,
        games: champ.games
      };
    });

  const averageKda = aggregation.totalGames
    ? ((aggregation.totalKills + aggregation.totalAssists) / Math.max(1, aggregation.totalDeaths)).toFixed(2)
    : "0.00";

  const averageDamageShare = aggregation.damageShares.length
    ? `${Math.round((aggregation.damageShares.reduce((sum, value) => sum + value, 0) / aggregation.damageShares.length) * 100)}%`
    : "—";

  const averageVision = aggregation.totalGames
    ? Math.round(aggregation.totalVision / aggregation.totalGames).toString()
    : "—";

  const highlightedMatches = [
    ...matchesByQueue.RANKED_SOLO,
    ...matchesByQueue.RANKED_FLEX
  ].sort((a, b) => b.kdaValue - a.kdaValue);

  const highlights = [];
  if (highlightedMatches[0]) {
    highlights.push(`${highlightedMatches[0].kda} ${highlightedMatches[0].champion} carry`);
  }
  if (highlightedMatches[1]) {
    highlights.push(`${highlightedMatches[1].cs} on ${highlightedMatches[1].champion}`);
  }
  if (aggregation.totalGames) {
    highlights.push(`${aggregation.totalWins} wins in last ${aggregation.totalGames} games`);
  }

  const rankedWins = rankedSolo?.wins ?? 0;
  const rankedLosses = rankedSolo?.losses ?? 0;
  const totalRankedGames = rankedWins + rankedLosses;
  const calculatedWinRate = totalRankedGames > 0 ? Math.round((rankedWins / totalRankedGames) * 100) : 0;

  return {
    profile: {
      name: profile.name,
      region,
      regionDisplay: region.toUpperCase(),
      level: profile.summonerLevel,
      profileIconId: profile.profileIconId,
      bannerClip: "",
      metaLine: `${region.toUpperCase()} · Level ${profile.summonerLevel}`,
      headline,
      rankLabel,
      roles: rolesSorted.slice(0, 3).length ? rolesSorted.slice(0, 3) : ["Fill"],
      highlights: highlights.length ? highlights.slice(0, 3) : ["Play more ranked games to unlock highlights"],
      stats: {
        winRate: {
          value: totalRankedGames > 0 ? `${calculatedWinRate}%` : "0%",
          subtext: totalRankedGames > 0 ? `${rankedLosses} ranked losses` : "Unranked"
        },
        seasonWins: {
          value: rankedWins.toString(),
          subtext: rankedSolo ? `${rankedLosses} ranked losses` : "Unranked"
        },
        averageKDA: {
          value: averageKda,
          subtext: `${aggregation.totalGames} recent matches`
        },
        damageShare: {
          value: averageDamageShare,
          subtext: "Average team damage share"
        },
        visionScore: {
          value: averageVision,
          subtext: "Vision score per game"
        }
      }
    },
    matches: matchesByQueue,
    champions: championSummaries
  };
}

function riotConfig() {
  const hasKey = !!RIOT_API_KEY;
  const keyPreview = RIOT_API_KEY ? `${RIOT_API_KEY.substring(0, 10)}...${RIOT_API_KEY.substring(RIOT_API_KEY.length - 5)}` : "MISSING";
  return {
    headers: {
      "X-Riot-Token": RIOT_API_KEY
    },
    timeout: 8000
  };
}

function resolveRole(teamPosition, fallbackRole) {
  const role = teamPosition && teamPosition !== "UTILITY" ? teamPosition : fallbackRole;
  switch (role) {
    case "MIDDLE":
    case "MID":
      return "Mid";
    case "TOP":
      return "Top";
    case "JUNGLE":
      return "Jungle";
    case "BOTTOM":
    case "ADC":
      return "ADC";
    case "UTILITY":
    case "SUPPORT":
      return "Support";
    default:
      return "Fill";
  }
}

function timeAgo(timestamp) {
  if (!timestamp) return "Recently";
  const now = Date.now();
  const delta = Math.max(0, now - Number(timestamp));
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function winRate(wins, losses) {
  const total = wins + losses;
  if (!total) return 0;
  return Math.round((wins / total) * 100);
}

function titleCase(value = "") {
  return value.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

function structuredClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

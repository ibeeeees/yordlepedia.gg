import { useState } from 'react';
import type { AppState, GameMode } from './types';
import { searchSummoner } from './services/api';
import ChampionSplash from './components/ChampionSplash';
import './styles/main.css';
import './styles/matches.css';

const INITIAL_STATE: AppState = {
  profile: {
    name: "Hide on bush",
    region: "kr",
    regionDisplay: "KR",
    level: 548,
    metaLine: "Level 548 · Top 0.001%",
    headline: "Challenger · 67.8% Winrate",
    rankLabel: "Ranked Solo · 1829 LP",
    roles: ["Mid", "Top", "Support"],
    highlights: [
      "21/3/9 Akali pentakill",
      "Perfect 12/0/15 Azir game",
      "1v4 Outplay as Ahri"
    ],
    stats: {
      seasonWins: { value: "892", subtext: "+42 in the last week" },
      averageKDA: { value: "8.92", subtext: "Last 20 ranked games" },
      damageShare: { value: "36%", subtext: "+15% vs role average" },
      visionScore: { value: "45", subtext: "Top 1% in role" }
    }
  },
  matches: {
    RANKED_SOLO: [
      {
        id: "KR1",
        gameMode: "RANKED_SOLO",
        champion: "Azir",
        championId: 268,
        role: "Mid",
        duration: "32m",
        result: "win",
        kills: 12,
        deaths: 0,
        assists: 15,
        kda: "12/0/15",
        kdaValue: 27,
        kdaString: "Perfect",
        cs: "342",
        csString: "342 (10.7/min)",
        kp: "82",
        kpString: "82% KP",
        timestamp: "2 hours ago",
        timeAgo: "2h"
      }
    ],
    RANKED_FLEX: [],
    ARAM: []
  },
  champions: [
    {
      name: "Azir",
      role: "Mid",
      gamesPlayed: 158,
      games: 158,
      winRateString: "71.5%",
      winRate: "71.5",
      kdaString: "7.2",
      kda: "8/2/6",
      kills: 8,
      deaths: 2,
      assists: 6
    }
  ],
  leaderboard: [
    { rank: 1, name: "Gen G Chovy", lp: 1892, wr: "66%", role: "Mid" },
    { rank: 2, name: "DK ShowMaker", lp: 1845, wr: "64%", role: "Mid" },
    { rank: 3, name: "T1 Faker", lp: 1829, wr: "68%", role: "Mid" }
  ]
};

function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [searchInput, setSearchInput] = useState('');
  const [region, setRegion] = useState('na1');
  const [isSearching, setIsSearching] = useState(false);
  const [activeGameMode, setActiveGameMode] = useState<GameMode>('RANKED_SOLO');
  
  const handleSearch = async () => {
    if (!searchInput.trim()) {
      alert('Please enter a summoner name to search.');
      return;
    }

    setIsSearching(true);
    try {
      const data = await searchSummoner(region, searchInput);
      setState(data);
    } catch (error) {
      console.error('Search error:', error);
      alert(error instanceof Error ? error.message : 'Failed to search summoner');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container">
      <main>
        <section className="hero">
          <div className="section-content">
            <div className="match-list">
              <div className="section-header">
                <h2>Recent Matches</h2>
                <div className="game-mode-tabs">
                  {(['RANKED_SOLO', 'RANKED_FLEX', 'ARAM'] as GameMode[]).map(mode => (
                    <button
                      key={mode}
                      className={`game-mode-tab ${activeGameMode === mode ? 'active' : ''}`}
                      onClick={() => setActiveGameMode(mode)}
                    >
                      {mode.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              {state.matches[activeGameMode].map(match => (
                <div key={match.id} className={`match-card ${match.result}`}>
                  <ChampionSplash championId={match.championId} className="champion-splash" />
                  <div className="match-content">
                    <div className="match-header">
                      <span className="role-tag">{match.role}</span>
                      <span className="match-duration">{match.duration}</span>
                    </div>
                    <div className="match-stats">
                      <div className="champion-info">
                        <div className="champion-icon">
                          <img 
                            src={`https://ddragon.leagueoflegends.com/cdn/13.20.1/img/champion/${match.champion}.png`}
                            alt={match.champion}
                            loading="lazy"
                          />
                        </div>
                        <span>{match.champion}</span>
                      </div>
                      <div className="game-stats">
                        <div className="kda">
                          <span>{match.kills}/{match.deaths}/{match.assists}</span>
                          <span className="kda-ratio">{match.kdaString} KDA</span>
                        </div>
                        <div className="farm-vision">
                          <span>{match.csString} CS</span>
                          <span>{match.kpString} KP</span>
                        </div>
                      </div>
                      <time>{match.timestamp}</time>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

const INITIAL_STATE: AppState = {
  profile: {
    name: "Hide on bush",
    region: "kr",
    regionDisplay: "KR",
    level: 548,
    metaLine: "Level 548 · Top 0.001%",
    headline: "Challenger · 67.8% Winrate",
    rankLabel: "Ranked Solo · 1829 LP",
    roles: ["Mid", "Top", "Support"],
    highlights: [
      "21/3/9 Akali pentakill",
      "Perfect 12/0/15 Azir game",
      "1v4 Outplay as Ahri"
    ],
    stats: {
      seasonWins: { value: "892", subtext: "+42 in the last week" },
      averageKDA: { value: "8.92", subtext: "Last 20 ranked games" },
      damageShare: { value: "36%", subtext: "+15% vs role average" },
      visionScore: { value: "45", subtext: "Top 1% in role" }
    }
  },
  matches: {
    RANKED_SOLO: [
      {
        id: "KR1",
        gameMode: "RANKED_SOLO",
        champion: "Azir",
        championId: 268,
        role: "Mid",
        duration: "32m",
        result: "win",
        kills: 12,
        deaths: 0,
        assists: 15,
        kda: "12/0/15",
        kdaValue: 27,
        kdaString: "Perfect",
        cs: "342",
        csString: "342 (10.7/min)",
        kp: "82",
        kpString: "82% KP",
        timestamp: "2 hours ago",
        timeAgo: "2h"
      }
    ],
    RANKED_FLEX: [],
    ARAM: []
  },
  champions: [
    {
      name: "Azir",
      role: "Mid",
      gamesPlayed: 158,
      games: 158,
      winRateString: "71.5%",
      winRate: "71.5",
      kdaString: "7.2",
      kda: "8/2/6",
      kills: 8,
      deaths: 2,
      assists: 6
    }
  ],
  leaderboard: [
    { rank: 1, name: "Gen G Chovy", lp: 1892, wr: "66%", role: "Mid" },
    { rank: 2, name: "DK ShowMaker", lp: 1845, wr: "64%", role: "Mid" },
    { rank: 3, name: "T1 Faker", lp: 1829, wr: "68%", role: "Mid" }
  ]
};

function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [searchInput, setSearchInput] = useState('');
  const [region, setRegion] = useState('na1');
  const [isSearching, setIsSearching] = useState(false);
  const [activeGameMode, setActiveGameMode] = useState<GameMode>('RANKED_SOLO');
  const [bannerVideo, setBannerVideo] = useState<File | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const handleSearch = async () => {
    if (!searchInput.trim()) {
      alert('Please enter a summoner name to search.');
      return;
    }

    setIsSearching(true);
    try {
      const data = await searchSummoner(region, searchInput);
      setState(data);
    } catch (error) {
      console.error('Search error:', error);
      alert(error instanceof Error ? error.message : 'Failed to search summoner');
    } finally {
      setIsSearching(false);
    }
  };

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setBannerVideo(file);
    } else {
      alert('Please select a valid video file');
    }
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  return (
    <div className="container">
      <main>
        <section className="hero">
          <div className="section-content">
            <div className="match-list">
              {state.matches[activeGameMode].map(match => (
                <div key={match.id} className={`match-card ${match.result}`}>
                  <ChampionSplash championId={match.championId} className="champion-splash" />
                  <div className="match-content">
                    <div className="match-header">
                      <span className="role-tag">{match.role}</span>
                      <span className="match-duration">{match.duration}</span>
                    </div>
                    <div className="match-stats">
                      <div className="champion-info">
                        <div className="champion-icon">
                          <img 
                            src={`https://ddragon.leagueoflegends.com/cdn/13.20.1/img/champion/${match.champion}.png`}
                            alt={match.champion}
                            loading="lazy"
                          />
                        </div>
                        <span>{match.champion}</span>
                      </div>
                      <div className="game-stats">
                        <div className="kda">
                          <span>{match.kills}/{match.deaths}/{match.assists}</span>
                          <span className="kda-ratio">{match.kdaString} KDA</span>
                        </div>
                        <div className="farm-vision">
                          <span>{match.csString} CS</span>
                          <span>{match.kpString} KP</span>
                        </div>
                      </div>
                      <time>{match.timestamp}</time>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

interface Stats {
  value: string;
  subtext: string;
}

interface ProfileStats {
  seasonWins: Stats;
  averageKDA: Stats;
  damageShare: Stats;
  visionScore: Stats;
}

const FALLBACK_DATA: AppState = {
  profile: {
    name: "Hide on bush",
    region: "kr",
    regionDisplay: "KR",
    level: 548,
    metaLine: "Level 548 · Top 0.001%",
    headline: "Challenger · 67.8% Winrate",
    rankLabel: "Ranked Solo · 1829 LP",
    roles: ["Mid", "Top", "Support"],
    highlights: [
      "21/3/9 Akali pentakill",
      "Perfect 12/0/15 Azir game",
      "1v4 Outplay as Ahri"
    ],
    stats: {
      seasonWins: { value: "892", subtext: "+42 in the last week" },
      averageKDA: { value: "8.92", subtext: "Last 20 ranked games" },
      damageShare: { value: "36%", subtext: "+15% vs role average" },
      visionScore: { value: "45", subtext: "Top 1% in role" }
    }
  },
  matches: {
    RANKED_SOLO: [
      {
        id: "KR1",
        gameMode: "RANKED_SOLO",
        champion: "Azir",
        championId: 268,
        role: "Mid",
        duration: "32m",
        result: "win",
        kills: 12,
        deaths: 0,
        assists: 15,
        kda: "12/0/15",
        kdaValue: 27,
        kdaString: "Perfect",
        cs: "342",
        csString: "342 (10.7/min)",
        kp: "82",
        kpString: "82% KP",
        timestamp: "2 hours ago",
        timeAgo: "2h"
      }
    ],
    RANKED_FLEX: [],
    ARAM: []
  },
  champions: [
    {
      name: "Azir",
      role: "Mid",
      gamesPlayed: 158,
      games: 158,
      winRateString: "71.5%",
      winRate: "71.5",
      kdaString: "7.2",
      kda: "8/2/6",
      kills: 8,
      deaths: 2,
      assists: 6
    }
  ],
  leaderboard: [
    { rank: 1, name: "Gen G Chovy", lp: 1892, wr: "66%", role: "Mid" },
    { rank: 2, name: "DK ShowMaker", lp: 1845, wr: "64%", role: "Mid" },
    { rank: 3, name: "T1 Faker", lp: 1829, wr: "68%", role: "Mid" }
  ]
}
};

function App() {
  const [state, setState] = useState<AppState>(FALLBACK_DATA);
  
  return (
    <div className="container">
      <main>
        <section className="hero">
          <div className="section-content">
            <div className="hero-text">
              <h1>All Your <span>League Data</span> In One Place</h1>
              <p className="accent-text">
                Search any summoner worldwide, dive into in-depth analytics, and stay ahead of the meta 
                with real-time insights engineered for climbers, creators, and coaching teams.
              </p>
              <div className="cta-actions">
                <button className="search-btn" onClick={handleDownload}>
                  Download Desktop Companion
                </button>
              </div>
            </div>

            <article className="search-card" id="search">evel 548 · Top 0.001%",
    headline: "Challenger · 67.8% Winrate",
    rankLabel: "Ranked Solo · 1829 LP",
    roles: ["Mid", "Top", "Support"],
    highlights: [
      "21/3/9 Akali pentakill",
      "Perfect 12/0/15 Azir game",
      "1v4 Outplay as Ahri"
    ],
    stats: {
      seasonWins: { value: "892", subtext: "+42 in the last week" },
      averageKDA: { value: "8.92", subtext: "Last 20 ranked games" },
      damageShare: { value: "36%", subtext: "+15% vs role average" },
      visionScore: { value: "45", subtext: "Top 1% in role" }
    }
  },
  matches: {
    RANKED_SOLO: [
      {
        id: "KR1",
        gameMode: "RANKED_SOLO",
        champion: "Azir",
        role: "Mid",
        duration: "32m",
        result: "win",
        kills: 12,
        deaths: 0,
        assists: 15,
        kda: "12/0/15",
        kdaValue: 27,
        kdaString: "Perfect",
        cs: "342",
        csString: "342 (10.7/min)",
        kp: "82",
        kpString: "82% KP",
        timestamp: "2 hours ago",
        timeAgo: "2h"
      },
      {
        id: "KR2",
        gameMode: "RANKED_SOLO",
        champion: "Akali",
        role: "Mid",
        duration: "28m",
        result: "win",
        kills: 21,
        deaths: 3,
        assists: 9,
        kda: "21/3/9",
        kdaValue: 10.0,
        kdaString: "10.0",
        cs: "286",
        csString: "286 (10.2/min)",
        kp: "75",
        kpString: "75% KP",
        timestamp: "4 hours ago",
        timeAgo: "4h"
      },
      {
        id: "KR3",
        gameMode: "RANKED_SOLO",
        champion: "Ahri",
        role: "Mid",
        duration: "35m",
        result: "win",
        kills: 15,
        deaths: 2,
        assists: 12,
        kda: "15/2/12",
        kdaValue: 13.5,
        kdaString: "13.5",
        cs: "328",
        csString: "328 (9.4/min)",
        kp: "68",
        kpString: "68% KP",
        timestamp: "6 hours ago",
        timeAgo: "6h"
      },
      {
        id: "KR4",
        gameMode: "RANKED_SOLO",
        champion: "Syndra",
        role: "Mid",
        duration: "25m",
        result: "win",
        kills: 8,
        deaths: 1,
        assists: 6,
        kda: "8/1/6",
        kdaValue: 14.0,
        kdaString: "14.0",
        cs: "256",
        csString: "256 (10.2/min)",
        kp: "78",
        kpString: "78% KP",
        timestamp: "8 hours ago",
        timeAgo: "8h"
      },
      {
        id: "KR5",
        gameMode: "RANKED_SOLO",
        champion: "Zed",
        role: "Mid",
        duration: "29m",
        result: "loss",
        kills: 11,
        deaths: 4,
        assists: 3,
        kda: "11/4/3",
        kdaValue: 3.5,
        kdaString: "3.5",
        cs: "275",
        csString: "275 (9.5/min)",
        kp: "70",
        kpString: "70% KP",
        timestamp: "10 hours ago",
        timeAgo: "10h"
      }
    ],
    RANKED_FLEX: [
      {
        id: "KRF1",
        gameMode: "RANKED_FLEX",
        champion: "Sylas",
        role: "Mid",
        duration: "31m",
        result: "win",
        kills: 14,
        deaths: 5,
        assists: 8,
        kda: "14/5/8",
        kdaValue: 4.4,
        kdaString: "4.4",
        cs: "289",
        csString: "289 (9.3/min)",
        kp: "65",
        kpString: "65% KP",
        timestamp: "1 day ago",
        timeAgo: "1d"
      }
    ],
    ARAM: [
      {
        id: "KRA1",
        gameMode: "ARAM",
        champion: "Katarina",
        role: "Mid",
        duration: "18m",
        result: "win",
        kills: 25,
        deaths: 8,
        assists: 12,
        kda: "25/8/12",
        kdaValue: 4.6,
        kdaString: "4.6",
        cs: "85",
        csString: "85",
        kp: "90",
        kpString: "90% KP",
        timestamp: "2 days ago",
        timeAgo: "2d"
      }
    ]
  },
  champions: [
    {
      name: "Azir",
      role: "Mid",
      gamesPlayed: 158,
      games: 158,
      winRateString: "71.5%",
      winRate: "71.5",
      kdaString: "7.2",
      kda: "8/2/6",
      kills: 8,
      deaths: 2,
      assists: 6
    },
    {
      name: "Ahri",
      role: "Mid",
      gamesPlayed: 142,
      games: 142,
      winRateString: "68.3%",
      winRate: "68.3",
      kdaString: "6.8",
      kda: "7/2/8",
      kills: 7,
      deaths: 2,
      assists: 8
    },
    {
      name: "Akali",
      role: "Mid",
      gamesPlayed: 126,
      games: 126,
      winRateString: "65.9%",
      winRate: "65.9",
      kdaString: "5.9",
      kda: "9/3/5",
      kills: 9,
      deaths: 3,
      assists: 5
    }
  ],
  leaderboard: [
    { rank: 1, name: "Gen G Chovy", lp: 1892, wr: "66%", role: "Mid" },
    { rank: 2, name: "DK ShowMaker", lp: 1845, wr: "64%", role: "Mid" },
    { rank: 3, name: "T1 Faker", lp: 1829, wr: "68%", role: "Mid" },
    { rank: 4, name: "DK Kellin", lp: 1798, wr: "62%", role: "Support" },
    { rank: 5, name: "KT Aiming", lp: 1776, wr: "65%", role: "ADC" }
  ]
};

function App() {
  const [state, setState] = useState<AppState>(FALLBACK_DATA);
  const [searchInput, setSearchInput] = useState('');
  const [region, setRegion] = useState('na1');
  const [isSearching, setIsSearching] = useState(false);
  const [activeGameMode, setActiveGameMode] = useState<GameMode>('RANKED_SOLO');
  const [bannerVideo, setBannerVideo] = useState<File | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setBannerVideo(file);
    } else {
      alert('Please select a valid video file');
    }
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };
  
  // Refs for smooth scrolling
  const searchRef = useRef<HTMLElement>(null);
  const profileRef = useRef<HTMLElement>(null);
  const matchesRef = useRef<HTMLElement>(null);
  const championsRef = useRef<HTMLElement>(null);
  const leaderboardRef = useRef<HTMLElement>(null);
  const communityRef = useRef<HTMLElement>(null);
  const comingSoonRef = useRef<HTMLElement>(null);

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      alert('Please enter a summoner name to search.');
      return;
    }

    setIsSearching(true);
    try {
      const data = await searchSummoner(region, searchInput);
      setState(data);
    } catch (error) {
      console.error('Search error:', error);
      alert(error instanceof Error ? error.message : 'Failed to search summoner');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogin = () => {
    alert("Riot Games OAuth would open a secure login window here.");
  };

  const handleDownload = () => {
    alert("Desktop build coming soon!");
  };

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Add scroll animation handlers if needed
  }, []);

  return (
    <>
      <header>
        <nav>
          <div className="logo">Yordlepedia</div>
          <div className="nav-links">
            <button onClick={() => scrollToSection(searchRef)}>Search</button>
            <button onClick={() => scrollToSection(profileRef)}>Overview</button>
            <button onClick={() => scrollToSection(matchesRef)}>Matches</button>
            <button onClick={() => scrollToSection(championsRef)}>Champions</button>
            <button onClick={() => scrollToSection(leaderboardRef)}>Leaderboard</button>
            <button onClick={() => scrollToSection(communityRef)}>Community</button>
            <button onClick={() => scrollToSection(comingSoonRef)}>Coming Soon</button>
          </div>
          <button className="profile-btn" onClick={handleLogin}>
            My Profile
          </button>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-text">
            <h1>All Your <span>League Data</span> In One Place</h1>
            <p className="accent-text">
              Search any summoner worldwide, dive into in-depth analytics, and stay ahead of the meta 
              with real-time insights engineered for climbers, creators, and coaching teams.
            </p>
            <div className="cta-actions">
              <button className="download-btn" onClick={handleDownload}>
                Download Desktop Companion
              </button>
            </div>
          </div>

          <article className="search-card" ref={searchRef} id="search">
            <div className="search-header">
              <h3>Instant Summoner Lookup</h3>
              <span className="rank-pill">Live Stats</span>
            </div>
            <div className="search-wrapper">
              <select 
                id="regionSelect" 
                className="region-select"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="na1">NA</option>
                <option value="euw1">EUW</option>
                <option value="eun1">EUNE</option>
                <option value="kr">KR</option>
                <option value="br1">BR</option>
              </select>
              <input
                id="summonerSearch"
                className="search-input"
                type="search"
                placeholder="Search summoner name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                className="search-btn"
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? '⏳' : 'Search'}
              </button>
            </div>
            <p className="search-footer">
              Example: Try "Faker", "Tyler1" or "ShowMaker" to preview the profile experience.
            </p>
          </article>
        </section>

        {/* Profile Section */}
        {state.profile && (
          <section ref={profileRef} id="profile" className="section">
            <div className="section-header">
              <h2>Profile Spotlight</h2>
              <span>{state.profile.headline}</span>
            </div>
            <div className="profile-summary">
              <aside className="profile-card">
                <div className="profile-banner" onClick={() => alert('Video feature coming soon!')}>
                  <span className="play-pill">▶ Play Highlight</span>
                  <button className="set-banner-btn">Set Banner</button>
                </div>
                <div className="profile-identity">
                  <div className="avatar avatar-lg" aria-hidden="true" />
                  <div>
                    <h3>{state.profile.name}</h3>
                    <p className="stat-subtext">{state.profile.metaLine}</p>
                    <span className="rank-pill">{state.profile.rankLabel}</span>
                  </div>
                </div>
                <div className="profile-roles">
                  <h4>Preferred Roles</h4>
                  <div className="role-tags">
                    {state.profile.roles.map(role => (
                      <span key={role} className="role-tag">{role}</span>
                    ))}
                  </div>
                </div>
                <div className="profile-highlights">
                  <h4>Recent Highlights</h4>
                  <div className="highlight-list">
                    {state.profile.highlights.map((highlight, index) => (
                      <span key={index} className="highlight-item">{highlight}</span>
                    ))}
                  </div>
                </div>
              </aside>
              <div className="stat-grid">
                {Object.entries(state.profile.stats).map(([key, stat]) => (
                  <div className="stat-box" key={key}>
                    <div className="stat-label">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-subtext">{stat.subtext}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Match History Section */}
        <section ref={matchesRef} id="matches" className="section">
          <div className="section-header">
            <h2>Recent Match History</h2>
            <div className="game-mode-tabs">
              {(['RANKED_SOLO', 'RANKED_FLEX', 'ARAM'] as GameMode[]).map(mode => (
                <button
                  key={mode}
                  className={`game-mode-tab ${activeGameMode === mode ? 'active' : ''}`}
                  onClick={() => setActiveGameMode(mode)}
                >
                  {mode.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <div className="match-list">
            {state.matches[activeGameMode].map(match => (
              <div key={match.id} className={`match-card ${match.result}`}>
                <ChampionSplash championId={match.championId} className="champion-splash" />
                <div className="match-content">
                  <div className="match-header">
                    <span className="role-tag">{match.role}</span>
                    <span className="match-duration">{match.duration}</span>
                  </div>
                  <div className="match-stats">
                    <div className="champion-info">
                      <div className="champion-icon">
                        <img 
                          src={`https://ddragon.leagueoflegends.com/cdn/13.20.1/img/champion/${match.champion}.png`}
                          alt={match.champion}
                          loading="lazy"
                        />
                      </div>
                      <span>{match.champion}</span>
                    </div>
                    <div className="game-stats">
                      <div className="kda">
                        <span>{match.kills}/{match.deaths}/{match.assists}</span>
                        <span className="kda-ratio">{match.kdaString} KDA</span>
                      </div>
                      <div className="farm-vision">
                        <span>{match.csString} CS</span>
                        <span>{match.kpString} KP</span>
                      </div>
                    </div>
                    <time>{match.timestamp}</time>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Champion Performance Section */}
        <section ref={championsRef} id="champions" className="section">
          <div className="section-header">
            <h2>Champion Performance</h2>
            <span>Season 14 · Patch 14.15</span>
          </div>
          <div className="champion-grid">
            {state.champions.map(champ => (
              <div key={champ.name} className="champion-card">
                <div className="champion-header">
                  <div className="champion-icon" />
                  <div>
                    <h4>{champ.name}</h4>
                    <span className="role-tag">{champ.role}</span>
                  </div>
                  <span className="games-played">{champ.gamesPlayed} games</span>
                </div>
                <div className="champion-stats">
                  <div className="win-rate">
                    <span>{champ.winRateString} WR</span>
                    <div className="win-rate-bar" style={{ '--percent': champ.winRate } as any} />
                  </div>
                  <div className="kda-stats">
                    <span>{champ.kills}/{champ.deaths}/{champ.assists}</span>
                    <span>{champ.kdaString} KDA</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Leaderboard Section */}
        <section ref={leaderboardRef} id="leaderboard" className="section">
          <div className="section-header">
            <h2>Regional Leaderboard</h2>
            <span>NA · Top 5 Summoners</span>
          </div>
          <div className="leaderboard-table">
            <div className="leaderboard-headers">
              <span>Rank</span>
              <span>Summoner</span>
              <span>LP</span>
              <span>Win Rate</span>
              <span>Role</span>
            </div>
            {state.leaderboard.map(entry => (
              <div key={entry.name} className="leaderboard-row">
                <span className="rank">#{entry.rank}</span>
                <span className="summoner-name">{entry.name}</span>
                <span className="lp">{entry.lp}</span>
                <span className="winrate">{entry.wr}</span>
                <span className="role-tag">{entry.role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Community Insights Section */}
        <section ref={communityRef} id="community" className="section">
          <div className="section-header">
            <h2>Community & Insights</h2>
            <span>Stay ahead of the meta</span>
          </div>
          <div className="insights-grid">
            <div className="insight-card">
              <h3>Meta Forecast</h3>
              <p>Our analysts review 12 million games each patch to surface the strongest champions, builds, and rune paths per elo bracket.</p>
              <button className="insight-btn">Get The Desktop Overlay</button>
            </div>
            <div className="insight-card">
              <h3>Creator Hub</h3>
              <p>Stream alerts, sharable stat cards, and highlight automation help creators turn every climb into content worth watching.</p>
              <button className="insight-btn">Join Creator Program</button>
            </div>
            <div className="insight-card">
              <h3>Coaching Toolkit</h3>
              <p>Compare players role-by-role, review heatmaps, and analyze objective control timelines to pinpoint improvement areas.</p>
              <button className="insight-btn">Request Coach Access</button>
            </div>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section ref={comingSoonRef} id="coming-soon" className="section">
          <div className="section-header">
            <h2>Coming Soon</h2>
            <span>Roadmap highlights</span>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-status">SOON</span>
              <h3>Profile Video Banner</h3>
              <p>Choose any clip as your profile banner. Showcase your best plays right at the top of your page.</p>
            </div>
            <div className="feature-card">
              <span className="feature-status">SOON</span>
              <h3>Tier Lists by Role</h3>
              <p>Data-driven tier lists for Top, Jungle, Mid, ADC, and Support with patch-by-patch trends.</p>
            </div>
            <div className="feature-card">
              <span className="feature-status">SOON</span>
              <h3>Desktop Overlay</h3>
              <p>Downloadable app with in-game overlay for build tips, timers, and matchup notes.</p>
              <button className="feature-btn">Get Overlay</button>
            </div>
            <div className="feature-card">
              <span className="feature-status">SOON</span>
              <h3>Social Comparison</h3>
              <p>Compare stats with friends on the same champions and roles over chosen time windows.</p>
            </div>
            <div className="feature-card">
              <span className="feature-status">SOON</span>
              <h3>Pro/Streamer Benchmarks</h3>
              <p>See how you stack up to pros and streamers. Side-by-side deltas on CS, vision, damage, and more.</p>
            </div>
            <div className="feature-card">
              <span className="feature-status">SOON</span>
              <h3>Mini Heatmaps</h3>
              <p>Role- and champ-specific hot zones to improve pathing and positioning.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Yordlepedia.gg</h4>
              <p>Competitive analytics built for League of Legends players across every skill tier.</p>
            </div>
            <div className="footer-section">
              <h4>Product</h4>
              <ul>
                <li>Summoner Search</li>
                <li>Champion Insights</li>
                <li>In-Game Overlay</li>
                <li>Team Analytics</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Resources</h4>
              <ul>
                <li>Patch Notes Companion</li>
                <li>Tier List Updates</li>
                <li>API Documentation</li>
                <li>Coaching Portal</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Community</h4>
              <ul>
                <li>Discord</li>
                <li>Twitter</li>
                <li>Reddit</li>
                <li>Support</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 Yordlepedia.gg · MIT License</p>
            <p className="disclaimer">
              Yordlepedia is not endorsed by Riot Games and does not reflect the views or opinions 
              of Riot Games or anyone officially involved in producing or managing League of Legends.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}

export default App;

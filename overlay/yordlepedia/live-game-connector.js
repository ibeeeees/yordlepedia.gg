/**
 * LIVE GAME DATA CONNECTOR
 *
 * Purpose: Connects to League of Legends LIVE CLIENT DATA API (In-Game)
 *
 * IMPORTANT: This is DIFFERENT from LCU API!
 * - LCU API: League Client (champion select, lobby) - Random port
 * - Live Client API: In-game data (stats, items, gold) - Port 2999
 *
 * Documentation: https://developer.riotgames.com/docs/lol#game-client-api
 * Base URL: https://127.0.0.1:2999/liveclientdata/
 * Authentication: NONE (no credentials needed!)
 *
 * This API only works when you're IN A GAME (not in lobby/champ select)
 */

const https = require('https');

class LiveGameConnector {
  constructor() {
    this.baseUrl = 'https://127.0.0.1:2999';
    this.connected = false;
  }

  /**
   * Make HTTP request to Live Client Data API
   * @param {string} endpoint - API endpoint (e.g., '/liveclientdata/activeplayer')
   * @returns {Promise<any>} - Parsed JSON response
   */
  async makeRequest(endpoint) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${endpoint}`;

      const options = {
        method: 'GET',
        rejectUnauthorized: false, // Accept self-signed cert
        timeout: 3000 // 3 second timeout
      };

      const req = https.request(url, options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              this.connected = true;
              resolve(JSON.parse(data));
            } else if (res.statusCode === 404) {
              // Not in game yet
              this.connected = false;
              resolve(null);
            } else {
              reject(new Error(`HTTP ${res.statusCode}`));
            }
          } catch (error) {
            reject(new Error(`Parse error: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        this.connected = false;
        // Game not started or API not available
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        this.connected = false;
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  /**
   * Check if game is active
   * @returns {Promise<boolean>}
   */
  async isGameActive() {
    try {
      await this.makeRequest('/liveclientdata/activeplayer');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get active player data
   * Returns: summonerName, level, currentGold, championStats, abilities, items, etc.
   */
  async getActivePlayerData() {
    try {
      return await this.makeRequest('/liveclientdata/activeplayer');
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all player scores
   * Returns: assists, creepScore, deaths, kills, wardScore
   */
  async getPlayerScores(summonerName) {
    try {
      return await this.makeRequest(`/liveclientdata/playerscores?summonerName=${encodeURIComponent(summonerName)}`);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all game data
   * Returns: activePlayer, allPlayers, events, gameData
   */
  async getAllGameData() {
    try {
      return await this.makeRequest('/liveclientdata/allgamedata');
    } catch (error) {
      return null;
    }
  }

  /**
   * Get game stats
   * Returns: gameMode, gameTime, mapName, mapNumber, mapTerrain
   */
  async getGameStats() {
    try {
      return await this.makeRequest('/liveclientdata/gamestats');
    } catch (error) {
      return null;
    }
  }

  /**
   * Get player summoner spells (cooldowns, etc.)
   */
  async getPlayerSummonerSpells(summonerName) {
    try {
      return await this.makeRequest(`/liveclientdata/playersummonerspells?summonerName=${encodeURIComponent(summonerName)}`);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get player main runes
   */
  async getPlayerMainRunes(summonerName) {
    try {
      return await this.makeRequest(`/liveclientdata/playermainrunes?summonerName=${encodeURIComponent(summonerName)}`);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get player items
   */
  async getPlayerItems(summonerName) {
    try {
      return await this.makeRequest(`/liveclientdata/playeritems?summonerName=${encodeURIComponent(summonerName)}`);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get event data (kills, deaths, dragon kills, etc.)
   */
  async getEventData() {
    try {
      return await this.makeRequest('/liveclientdata/eventdata');
    } catch (error) {
      return null;
    }
  }
}

module.exports = LiveGameConnector;

const { authenticate, createHttp1Request, createWebSocketConnection } = require('league-connect');

class LCUConnector {
  constructor() {
    this.credentials = null;
    this.connected = false;
    this.ws = null;
    this.listeners = {};
  }

  async connect() {
    try {
      console.log('Attempting to connect to League Client...');
      this.credentials = await authenticate();
      this.connected = true;
      console.log(' Connected to League Client!');
      console.log('   Port:', this.credentials.port);
      console.log('   Password:', this.credentials.password.substring(0, 10) + '...');

      // Setup WebSocket for live events
      await this.setupWebSocket();

      return true;
    } catch (error) {
      console.error(' Failed to connect to League Client:', error.message);
      this.connected = false;
      return false;
    }
  }

  async setupWebSocket() {
    try {
      this.ws = await createWebSocketConnection(this.credentials);
      console.log(' WebSocket connected for live events');

      // Subscribe to game events
      this.ws.subscribe('/lol-gameflow/v1/gameflow-phase', (data) => {
        this.emit('gameflow-phase', data);
      });

      this.ws.subscribe('/lol-champ-select/v1/session', (data) => {
        this.emit('champ-select', data);
      });

      // Handle WebSocket errors
      this.ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      this.ws.on('close', () => {
        console.log(' WebSocket disconnected');
        this.connected = false;
      });

    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
    }
  }

  async makeRequest(endpoint, method = 'GET') {
    if (!this.connected) {
      throw new Error('Not connected to League Client');
    }

    try {
      const response = await createHttp1Request(
        {
          method,
          url: endpoint,
        },
        this.credentials
      );
      return response.json();
    } catch (error) {
      console.error(`API Request failed [${method} ${endpoint}]:`, error.message);
      throw error;
    }
  }

  // Get active player data
  async getActivePlayerData() {
    try {
      const data = await this.makeRequest('/liveclientdata/activeplayer');
      return data;
    } catch (error) {
      return null;
    }
  }

  // Get player stats
  async getPlayerStats() {
    try {
      const data = await this.makeRequest('/liveclientdata/activeplayer');
      return {
        summonerName: data.summonerName,
        level: data.level,
        currentGold: data.currentGold,
        championStats: data.championStats
      };
    } catch (error) {
      return null;
    }
  }

  // Get player scores (CS, vision, etc.)
  async getPlayerScores() {
    try {
      const data = await this.makeRequest('/liveclientdata/playerscores');
      return data;
    } catch (error) {
      return null;
    }
  }

  // Get all game stats
  async getAllGameData() {
    try {
      const data = await this.makeRequest('/liveclientdata/allgamedata');
      return data;
    } catch (error) {
      return null;
    }
  }

  // Get game stats
  async getGameStats() {
    try {
      const data = await this.makeRequest('/liveclientdata/gamestats');
      return data;
    } catch (error) {
      return null;
    }
  }

  // Get current summoner
  async getCurrentSummoner() {
    try {
      const data = await this.makeRequest('/lol-summoner/v1/current-summoner');
      return data;
    } catch (error) {
      return null;
    }
  }

  // Get gameflow phase
  async getGameflowPhase() {
    try {
      const phase = await this.makeRequest('/lol-gameflow/v1/gameflow-phase');
      return phase;
    } catch (error) {
      return 'None';
    }
  }

  // Event emitter
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
    this.connected = false;
    console.log('Disconnected from League Client');
  }
}

module.exports = LCUConnector;

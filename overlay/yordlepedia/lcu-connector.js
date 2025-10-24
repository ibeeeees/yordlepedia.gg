const LeagueConnect = require('league-connect');
const { authenticate, request } = LeagueConnect;

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
      console.log('Connected to League Client!');
      console.log('Port:', this.credentials.port);

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
      // WebSocket support varies by version, skip for now
      console.log('WebSocket not available in this version - using polling only');
      return;

      /*
      this.ws = await createWsConnection(this.credentials);
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
      */
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
    }
  }

  async makeRequest(endpoint, method = 'GET') {
    if (!this.connected) {
      throw new Error('Not connected to League Client');
    }

    try {
      const response = await request(
        {
          method,
          url: endpoint,
        },
        this.credentials
      );
      // Response is already a Response object in v5.5.0
      if (response && typeof response.json === 'function') {
        return await response.json();
      }
      return response;
    } catch (error) {
      console.error(`API Request failed [${method} ${endpoint}]:`, error.message);
      throw error;
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

  // ✅ NEW: Remove specific event listener (prevents memory leaks)
  removeListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  // ✅ NEW: Remove all listeners for an event or all events
  removeAllListeners(event) {
    if (event) {
      delete this.listeners[event];
      console.log(`🧹 Removed all listeners for event: ${event}`);
    } else {
      this.listeners = {};
      console.log('🧹 Removed all event listeners');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null; // ✅ Clear reference
    }
    this.connected = false;
    this.credentials = null; // ✅ Clear credentials
    console.log('🔌 Disconnected from League Client');
  }

}

module.exports = LCUConnector;

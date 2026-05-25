/**
 * Central State Store for Truchet Music Studio
 * Implements a simple reactive observer pattern to coordinate between
 * UI, Audio Engine, and p5.js Canvas Manager.
 */

class StateStore {
  constructor() {
    this.state = {
      bpm: 120,
      tileSize: 40, // Default 40px corresponds to 8x8 grid (320px / 40px)
      symmetry: "D4", // Default D4 Wallpaper group
      transformation: "None",
      scaleIndex: 0, // C Major default
      instrument: "Grand Piano",
      playMode: "Melody",
      isPlaying: false,
      tiles: [], // 2D array storing grid tiles state (type, highlighted, position)
      activeTilesCount: 64, // Stats HUD dynamic counter
      dynamics: "Mezzo-Forte" // Stats HUD placeholder
    };
    this.listeners = {};
  }

  /**
   * Get a state property
   * @param {string} key 
   * @returns {*}
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Set a state property and notify subscribers
   * @param {string} key 
   * @param {*} value 
   */
  set(key, value) {
    const oldValue = this.state[key];
    
    // For arrays or objects, we check by reference (or value if needed), 
    // but for primitive states simple !== is perfect.
    if (oldValue !== value) {
      this.state[key] = value;
      this.notify(key, value, oldValue);
    }
  }

  /**
   * Register a callback listener for changes to a specific state property
   * @param {string} key - Use '*' to listen to all state changes
   * @param {function} callback - Receives (newValue, oldValue) or (key, newValue, oldValue) for '*'
   * @returns {function} - Unsubscribe function
   */
  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
    return () => {
      this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners registered to a key
   */
  notify(key, newValue, oldValue) {
    if (this.listeners[key]) {
      this.listeners[key].forEach(cb => {
        try {
          cb(newValue, oldValue);
        } catch (e) {
          console.error(`Error in observer callback for state key "${key}":`, e);
        }
      });
    }
    
    // Global listener notify
    if (this.listeners['*']) {
      this.listeners['*'].forEach(cb => {
        try {
          cb(key, newValue, oldValue);
        } catch (e) {
          console.error(`Error in global observer callback:`, e);
        }
      });
    }
  }
}

export const store = new StateStore();
export default store;

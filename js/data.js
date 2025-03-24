/**
 * data.js
 * Contains game state, constants, and initial data definitions
 */

// Game state object - holds all variables related to game progress
const gameState = {
  selectedTargetId: null,
  passwordAttempts: 0,
  cryptocurrency: 0,
  passwordAttemptsPerSecond: 0,
  cryptocurrencyPerSecond: 0,
  userCPU: 0,
  userGPU: 0,
  masterKeyTokens: 0,
  totalPAThisRun: 0,
  pausedHackingProgress: {},
  lastTimestamp: Date.now(),
  transactions: [],
  
  // Click efficiency - set by clickEfficiency upgrades
  clickPaAmount: 1,
  
  // Mining efficiency - set by miningEfficiency upgrades
  miningEfficiencyMultiplier: 1.0,
  
  // Personal miner state
  miner: {
    isRunning: false,
    startTime: null,
    totalMined: 0,
    baseHashRate: 3.0,
    hashRate: 3.0,
    lastUpdateTime: 0
  },
  
  // Hacking activity state
  hacking: {
    isActive: false,          // Whether hacking is currently active
    lastProgressUpdate: 0,    // Last time progress was updated
    progressCounter: 0,       // Counter for progress increases
    attemptsMade: 0           // Total attempts made this session
  }
};

// UI State - tracks window positions, visibility and z-index
const uiState = {
  windows: {
    miner: { isOpen: false, zIndex: 10, position: { x: 50, y: 50 }, wasMinimized: false },
    hackConsole: { isOpen: false, zIndex: 10, position: { x: 380, y: 50 }, wasMinimized: false },
    botnetControl: { isOpen: false, zIndex: 10, position: { x: 710, y: 50 }, wasMinimized: false },
    cryptoWallet: { isOpen: false, zIndex: 10, position: { x: 50, y: 350 }, wasMinimized: false },
    upgradeStore: { isOpen: false, zIndex: 10, position: { x: 380, y: 350 }, wasMinimized: false },
    systemPerformance: { isOpen: false, zIndex: 10, position: { x: 380, y: 350 }, wasMinimized: false },
    settings: { isOpen: false, zIndex: 10, position: { x: 710, y: 350 }, wasMinimized: false }
  },
  activeWindow: null,
  highestZIndex: 10
};

// Device definitions - populated from config.js
let allDevices = [];

// Upgrade definitions - populated from config.js
let upgradeDefinitions = [];

// Game constants - populated from config.js
let CLICK_PA_AMOUNT = 1; 
let PRESTIGE_THRESHOLD = 1000000;
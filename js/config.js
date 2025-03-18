/**
 * config.js
 * Central configuration file for all game settings
 * Edit this file to customize devices, upgrades, and game parameters
 */

/**
 * GAME CONSTANTS
 * Basic settings that affect gameplay
 */
const CONFIG = {
  // Gameplay Settings
  gameplay: {
    // Initial game settings
    initialCryptocurrency: 5.0,     // Starting cryptocurrency amount
    
    // Manual hacking
    clickPaAmount: 1,                // Password attempts per manual hack click
    
    // Prestige system
    prestigeThreshold: 1000000,      // Password attempts needed for prestige
    prestigeTokenBonus: 0.1,         // Multiplier bonus per token (0.1 = 10%)
    prestigeTokensPerReset: 1,       // Number of tokens awarded per prestige
    
    // Game loop
    updateFrequency: {
      resourceRates: 1000,           // How often to update resource rates (ms)
      botnetRefresh: 2000,           // How often to refresh botnet display (ms)
      browserRefresh: 3000           // How often to refresh browser content (ms)
    }
  },
  
  // Personal Crypto Miner Settings
  miner: {
    baseHashRate: 3.0,               // Base hash rate in H/s
    blockFindChance: 0.20,           // Chance to find a block (higher = more frequent)
    blockRewardMin: 0.2,             // Minimum CC per block
    blockRewardMax: 0.8,             // Maximum CC per block
    cpuBoostPerPoint: 0.5,           // Additional H/s per CPU point
    gpuBoostPerPoint: 1.0,           // Additional H/s per GPU point
    simulationDelay: 300,            // Min time between hash outputs (ms)
    maxTerminalLines: 100            // Maximum number of lines in terminal
  },
  
  // Window Positions and Sizes
  windows: {
    defaultPositions: {
      miner: { x: 50, y: 50 },
      hackConsole: { x: 380, y: 50 },
      botnetControl: { x: 710, y: 50 },
      cryptoWallet: { x: 50, y: 350 },
      upgradeStore: { x: 380, y: 350 },
      systemPerformance: { x: 380, y: 350 },
      settings: { x: 710, y: 350 }
    },
    defaultSizes: {
      miner: { width: "550px", height: "350px" },
      hackConsole: { width: "300px", height: "450px" },
      botnetControl: { width: "300px", height: "400px" },
      cryptoWallet: { width: "300px", height: "350px" },
      upgradeStore: { width: "500px", height: "550px" },
      systemPerformance: { width: "350px", height: "450px" },
      settings: { width: "400px", height: "500px" }
    }
  },
  
  // UI Settings
  ui: {
    notificationDuration: 5000,      // How long notifications stay visible (ms)
    maxNotifications: 3,             // Maximum number of notifications visible at once
    transactionHistorySize: 10       // Number of transactions to show in wallet
  }
};

/**
 * DEVICE DEFINITIONS
 * Define all available hackable devices here
 * Properties:
 * - id: Unique identifier for the device
 * - name: Display name for the device
 * - requiredAttempts: How many password attempts needed to crack
 * - cpuPower: CPU processing power gained when compromised (PA/s)
 * - gpuPower: GPU processing power gained when compromised (CC/s when miner installed)
 * - costCC: Cost in cryptocurrency to purchase access
 */
const DEVICES = [
  // TIER 1: PERSONAL DEVICES
  {
    id: 1,
    name: "Student Laptop",
    requiredAttempts: 25,
    cpuPower: 0.5,
    gpuPower: 0.2,
    costCC: 10
  },
  {
    id: 2,
    name: "Personal Laptop",
    requiredAttempts: 50,
    cpuPower: 1,
    gpuPower: 0.5,
    costCC: 25
  },
  {
    id: 3,
    name: "Home Desktop",
    requiredAttempts: 120,
    cpuPower: 2,
    gpuPower: 1,
    costCC: 50
  },
  {
    id: 4,
    name: "Gaming PC",
    requiredAttempts: 300,
    cpuPower: 3,
    gpuPower: 3,
    costCC: 120
  },
  {
    id: 5,
    name: "Workstation PC",
    requiredAttempts: 600,
    cpuPower: 5,
    gpuPower: 2,
    costCC: 200
  },
  
  // TIER 2: HOME NETWORK
  {
    id: 6,
    name: "Home Router",
    requiredAttempts: 800,
    cpuPower: 4,
    gpuPower: 0,
    costCC: 250
  },
  {
    id: 7,
    name: "Home NAS Server",
    requiredAttempts: 1200,
    cpuPower: 6,
    gpuPower: 1,
    costCC: 350
  },
  {
    id: 8,
    name: "Smart Home Hub",
    requiredAttempts: 1500,
    cpuPower: 7,
    gpuPower: 2,
    costCC: 450
  },
  {
    id: 9,
    name: "Media Server",
    requiredAttempts: 2000,
    cpuPower: 8,
    gpuPower: 4,
    costCC: 600
  },
  {
    id: 10,
    name: "Enthusiast Mining Rig",
    requiredAttempts: 3000,
    cpuPower: 6,
    gpuPower: 12,
    costCC: 900
  },
  
  // TIER 3: SMALL BUSINESS
  {
    id: 11,
    name: "Small Office Router",
    requiredAttempts: 4000,
    cpuPower: 10,
    gpuPower: 0,
    costCC: 1200
  },
  {
    id: 12,
    name: "Small Business Server",
    requiredAttempts: 6000,
    cpuPower: 15,
    gpuPower: 5,
    costCC: 1800
  },
  {
    id: 13,
    name: "Retail POS System",
    requiredAttempts: 8000,
    cpuPower: 12,
    gpuPower: 3,
    costCC: 2200
  },
  {
    id: 14,
    name: "Web Hosting Server",
    requiredAttempts: 10000,
    cpuPower: 20,
    gpuPower: 8,
    costCC: 3000
  },
  {
    id: 15,
    name: "Local ISP Node",
    requiredAttempts: 15000,
    cpuPower: 25,
    gpuPower: 10,
    costCC: 4500
  },
  
  // TIER 4: CORPORATE
  {
    id: 16,
    name: "Corporate Firewall",
    requiredAttempts: 25000,
    cpuPower: 30,
    gpuPower: 0,
    costCC: 6000
  },
  {
    id: 17,
    name: "Database Server",
    requiredAttempts: 35000,
    cpuPower: 40,
    gpuPower: 15,
    costCC: 9000
  },
  {
    id: 18,
    name: "Cloud VM Cluster",
    requiredAttempts: 50000,
    cpuPower: 60,
    gpuPower: 30,
    costCC: 12500
  },
  {
    id: 19,
    name: "Corporate Email Server",
    requiredAttempts: 75000,
    cpuPower: 80,
    gpuPower: 25,
    costCC: 18000
  },
  {
    id: 20,
    name: "Corporate Data Center",
    requiredAttempts: 100000,
    cpuPower: 120,
    gpuPower: 60,
    costCC: 25000
  },
  
  // TIER 5: GOVERNMENT/RESEARCH
  {
    id: 21,
    name: "University Research Server",
    requiredAttempts: 150000,
    cpuPower: 150,
    gpuPower: 80,
    costCC: 40000
  },
  {
    id: 22,
    name: "Financial Institution Server",
    requiredAttempts: 225000,
    cpuPower: 200,
    gpuPower: 100,
    costCC: 60000
  },
  {
    id: 23,
    name: "Government Database",
    requiredAttempts: 300000,
    cpuPower: 250,
    gpuPower: 125,
    costCC: 90000
  },
  {
    id: 24,
    name: "Military Network Node",
    requiredAttempts: 450000,
    cpuPower: 350,
    gpuPower: 175,
    costCC: 120000
  },
  {
    id: 25,
    name: "Government Mainframe",
    requiredAttempts: 600000,
    cpuPower: 500,
    gpuPower: 250,
    costCC: 180000
  },
  
  // TIER 6: ADVANCED/SPECIALIZED
  {
    id: 26,
    name: "AI Research Cluster",
    requiredAttempts: 800000,
    cpuPower: 750,
    gpuPower: 800,
    costCC: 250000
  },
  {
    id: 27,
    name: "Quantum Computing Lab",
    requiredAttempts: 1200000,
    cpuPower: 1200,
    gpuPower: 1000,
    costCC: 400000
  },
  {
    id: 28,
    name: "Space Agency Network",
    requiredAttempts: 2000000,
    cpuPower: 2000,
    gpuPower: 1500,
    costCC: 700000
  },
  {
    id: 29,
    name: "Cryptocurrency Exchange",
    requiredAttempts: 3000000,
    cpuPower: 2500,
    gpuPower: 3000,
    costCC: 1200000
  },
  {
    id: 30,
    name: "Global Network Nexus",
    requiredAttempts: 5000000,
    cpuPower: 5000,
    gpuPower: 5000,
    costCC: 2000000
  }
];

/**
 * UPGRADE DEFINITIONS
 * Define all available upgrades for purchase
 * Properties:
 * - id: Unique identifier for the upgrade
 * - name: Display name for the upgrade
 * - description: Description shown in the store
 * - costCC: Cost in cryptocurrency
 * - cpuRequirement: CPU power required to purchase
 * - gpuRequirement: GPU power required to purchase
 * - effectType: Type of effect (hackingEfficiency, botnetBoost, userCPU, userGPU, etc.)
 * - effectValue: Value of the effect
 */
const UPGRADES = [
  // HACKING EFFICIENCY UPGRADES
  {
    id: 1,
    name: "Basic Password Tool",
    description: "Each target requires 10% fewer attempts to crack.",
    costCC: 75,
    cpuRequirement: 1,
    gpuRequirement: 0,
    effectType: "hackingEfficiency",
    effectValue: 0.1
  },
  {
    id: 2,
    name: "Leaked Password Database",
    description: "Each target requires 15% fewer attempts to crack.",
    costCC: 300,
    cpuRequirement: 5,
    gpuRequirement: 0,
    effectType: "hackingEfficiency",
    effectValue: 0.15
  },
  {
    id: 3,
    name: "Advanced Brute Force Suite",
    description: "Each target requires 20% fewer attempts to crack.",
    costCC: 2500,
    cpuRequirement: 25,
    gpuRequirement: 0,
    effectType: "hackingEfficiency",
    effectValue: 0.2
  },
  {
    id: 4,
    name: "Quantum Decryption Algorithm",
    description: "Each target requires 25% fewer attempts to crack.",
    costCC: 15000,
    cpuRequirement: 100,
    gpuRequirement: 50,
    effectType: "hackingEfficiency",
    effectValue: 0.25
  },
  
  // BOTNET PERFORMANCE UPGRADES
  {
    id: 5,
    name: "Basic Network Optimizer",
    description: "+20% to all compromised devices' CPU and GPU output.",
    costCC: 200,
    cpuRequirement: 3,
    gpuRequirement: 0,
    effectType: "botnetBoost",
    effectValue: 0.2
  },
  {
    id: 6,
    name: "Improved Malware Engine",
    description: "+35% to all compromised devices' CPU and GPU output.",
    costCC: 1000,
    cpuRequirement: 15,
    gpuRequirement: 5,
    effectType: "botnetBoost",
    effectValue: 0.35
  },
  {
    id: 7,
    name: "Advanced Botnet Control",
    description: "+50% to all compromised devices' CPU and GPU output.",
    costCC: 7500,
    cpuRequirement: 50,
    gpuRequirement: 20,
    effectType: "botnetBoost",
    effectValue: 0.5
  },
  {
    id: 8,
    name: "Quantum Network Synchronizer",
    description: "+75% to all compromised devices' CPU and GPU output.",
    costCC: 50000,
    cpuRequirement: 200,
    gpuRequirement: 100,
    effectType: "botnetBoost",
    effectValue: 0.75
  },
  
  // USER HARDWARE UPGRADES - CPU
  {
    id: 9,
    name: "Basic CPU Upgrade",
    description: "+3 CPU Power for your own machine.",
    costCC: 100,
    cpuRequirement: 0,
    gpuRequirement: 0,
    effectType: "userCPU",
    effectValue: 3
  },
  {
    id: 10,
    name: "Mid-range CPU Upgrade",
    description: "+8 CPU Power for your own machine.",
    costCC: 500,
    cpuRequirement: 0,
    gpuRequirement: 0,
    effectType: "userCPU",
    effectValue: 8
  },
  {
    id: 11,
    name: "High-end CPU Upgrade",
    description: "+15 CPU Power for your own machine.",
    costCC: 3000,
    cpuRequirement: 0,
    gpuRequirement: 0,
    effectType: "userCPU",
    effectValue: 15
  },
  {
    id: 12,
    name: "Server-grade CPU Upgrade",
    description: "+30 CPU Power for your own machine.",
    costCC: 12000,
    cpuRequirement: 0,
    gpuRequirement: 0,
    effectType: "userCPU",
    effectValue: 30
  },
  {
    id: 13,
    name: "Quantum CPU Integration",
    description: "+60 CPU Power for your own machine.",
    costCC: 40000,
    cpuRequirement: 0,
    gpuRequirement: 0,
    effectType: "userCPU",
    effectValue: 60
  },
  
  // USER HARDWARE UPGRADES - GPU
  {
    id: 14,
    name: "Basic GPU Upgrade",
    description: "+5 GPU Power for your own machine.",
    costCC: 150,
    cpuRequirement: 0,
    gpuRequirement: 0,
    effectType: "userGPU",
    effectValue: 5
  },
  {
    id: 15,
    name: "Mid-range GPU Upgrade",
    description: "+12 GPU Power for your own machine.",
    costCC: 800,
    cpuRequirement: 0,
    gpuRequirement: 0,
    effectType: "userGPU",
    effectValue: 12
  },
  {
    id: 16,
    name: "High-end GPU Upgrade",
    description: "+25 GPU Power for your own machine.",
    costCC: 5000,
    cpuRequirement: 0,
    gpuRequirement: 0,
    effectType: "userGPU",
    effectValue: 25
  },
  {
    id: 17,
    name: "Multi-GPU Setup",
    description: "+50 GPU Power for your own machine.",
    costCC: 20000,
    cpuRequirement: 0,
    gpuRequirement: 0,
    effectType: "userGPU",
    effectValue: 50
  },
  {
    id: 18,
    name: "Quantum GPU Integration",
    description: "+100 GPU Power for your own machine.",
    costCC: 80000,
    cpuRequirement: 0,
    gpuRequirement: 0,
    effectType: "userGPU",
    effectValue: 100
  },
  
  // SPECIAL ABILITIES
  {
    id: 19,
    name: "Basic Password Breaker",
    description: "5% chance to instantly crack a target when you start hacking it.",
    costCC: 600,
    cpuRequirement: 10,
    gpuRequirement: 0,
    effectType: "instantCrack",
    effectValue: 0.05
  },
  {
    id: 20,
    name: "Advanced Password Breaker",
    description: "10% chance to instantly crack a target when you start hacking it.",
    costCC: 4000,
    cpuRequirement: 30,
    gpuRequirement: 10,
    effectType: "instantCrack",
    effectValue: 0.1
  },
  {
    id: 21,
    name: "Zero-day Exploit Kit",
    description: "15% chance to instantly crack a target when you start hacking it.",
    costCC: 25000,
    cpuRequirement: 100,
    gpuRequirement: 50,
    effectType: "instantCrack",
    effectValue: 0.15
  },
  
  // MULTIPLIER UPGRADES
  {
    id: 22,
    name: "Basic Network Amplifier",
    description: "Increases overall output by 50%.",
    costCC: 2000,
    cpuRequirement: 20,
    gpuRequirement: 10,
    effectType: "botnetMultiplier",
    effectValue: 1.5
  },
  {
    id: 23,
    name: "Advanced Network Amplifier",
    description: "Doubles overall output.",
    costCC: 10000,
    cpuRequirement: 50,
    gpuRequirement: 25,
    effectType: "botnetMultiplier",
    effectValue: 2
  },
  {
    id: 24,
    name: "Quantum Network Amplifier",
    description: "Triples overall output.",
    costCC: 60000,
    cpuRequirement: 200,
    gpuRequirement: 100,
    effectType: "botnetMultiplier",
    effectValue: 3
  },
  
  // CLICK EFFICIENCY UPGRADES
  {
    id: 25,
    name: "Click Automation Script",
    description: "Each manual hack click generates 3 password attempts instead of 1.",
    costCC: 350,
    cpuRequirement: 5,
    gpuRequirement: 0,
    effectType: "clickEfficiency",
    effectValue: 3
  },
  {
    id: 26,
    name: "Advanced Click Automation",
    description: "Each manual hack click generates 10 password attempts.",
    costCC: 3500,
    cpuRequirement: 25,
    gpuRequirement: 10,
    effectType: "clickEfficiency",
    effectValue: 10
  },
  {
    id: 27,
    name: "Quantum Click Accelerator",
    description: "Each manual hack click generates 25 password attempts.",
    costCC: 30000,
    cpuRequirement: 100,
    gpuRequirement: 50,
    effectType: "clickEfficiency",
    effectValue: 25
  },
  
  // MINING EFFICIENCY UPGRADES
  {
    id: 28,
    name: "Mining Algorithm Optimizer",
    description: "Increases mining rewards by 50%.",
    costCC: 1500,
    cpuRequirement: 0,
    gpuRequirement: 15,
    effectType: "miningEfficiency",
    effectValue: 1.5
  },
  {
    id: 29,
    name: "Advanced Mining Algorithm",
    description: "Doubles mining rewards.",
    costCC: 8000,
    cpuRequirement: 0,
    gpuRequirement: 40,
    effectType: "miningEfficiency",
    effectValue: 2
  },
  {
    id: 30,
    name: "Quantum Mining Protocol",
    description: "Triples mining rewards.",
    costCC: 45000,
    cpuRequirement: 0,
    gpuRequirement: 120,
    effectType: "miningEfficiency",
    effectValue: 3
  }
];

/**
 * PASSWORD GENERATION SETTINGS
 * Configure how random passwords are generated
 */
const PASSWORD_CONFIG = {
  // Character sets for random passwords
  characterSets: {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
  },
  
  // Common words and patterns to make passwords look realistic
  commonWords: [
    "admin", "password", "secure", "user", "login", "root", "system", 
    "network", "server", "backup", "database", "web", "app", "site",
    "test", "dev", "prod", "staging", "qa", "data"
  ],
  
  specialDates: [
    "1234", "2021", "2022", "2023", "2000", "123", "12345", "111", "000",
    "999", "777", "666", "555", "321", "abc", "xyz"
  ],
  
  // Password patterns
  patterns: {
    wordBasedChance: 0.4,    // Chance to use word-based pattern (vs random)
    secondWordChance: 0.5,   // Chance to add a second word
    suffixChance: 0.7,       // Chance to add a number suffix
    symbolChance: 0.3,       // Chance to add a symbol
    capitalizeChance: 0.5,   // Chance to capitalize first letter
    randomLength: {          // Length for random pattern
      min: 8,
      max: 15
    },
    endSymbolChance: 0.2     // Chance to add a symbol at the end of random pattern
  }
};

/**
 * INITIALIZATION FUNCTION
 * Don't edit below this line unless you know what you're doing
 */
function initializeFromConfig() {
  // Initialize game constants
  CLICK_PA_AMOUNT = CONFIG.gameplay.clickPaAmount;
  PRESTIGE_THRESHOLD = CONFIG.gameplay.prestigeThreshold;
  
  // Initialize devices from config
  allDevices = DEVICES.map(device => ({
    id: device.id,
    name: device.name,
    requiredAttempts: device.requiredAttempts,
    cpuPower: device.cpuPower,
    gpuPower: device.gpuPower,
    costCC: device.costCC,
    // Default runtime values
    isCompromised: false,
    currentProgress: 0,
    hasMiner: false,
    visible: true,
    isPurchased: false
  }));
  
  // Initialize upgrades from config
  upgradeDefinitions = UPGRADES.map(upgrade => ({
    id: upgrade.id,
    name: upgrade.name,
    description: upgrade.description,
    costCC: upgrade.costCC,
    cpuRequirement: upgrade.cpuRequirement,
    gpuRequirement: upgrade.gpuRequirement,
    effectType: upgrade.effectType,
    effectValue: upgrade.effectValue,
    // Default runtime value
    purchased: false
  }));
  
  // Initialize window positions
  Object.keys(CONFIG.windows.defaultPositions).forEach(windowType => {
    if (uiState.windows[windowType]) {
      uiState.windows[windowType].position = { 
        x: CONFIG.windows.defaultPositions[windowType].x,
        y: CONFIG.windows.defaultPositions[windowType].y
      };
    }
  });
  
  // Initialize personal miner settings
  gameState.miner.baseHashRate = CONFIG.miner.baseHashRate;
  
  // Initialize starting cryptocurrency amount
  gameState.cryptocurrency = CONFIG.gameplay.initialCryptocurrency;
  
  console.log("Game configuration loaded successfully!");
} 
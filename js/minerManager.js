/**
 * minerManager.js
 * Controls the personal crypto miner terminal functionality
 */

/**
 * Updates the miner content and initializes terminal functionality
 */
const updateMinerContent = () => {
  if (!uiState.windows.miner.isOpen) return;
  
  // Set up terminal input event listener
  const terminalInput = document.getElementById("terminal-input");
  if (terminalInput && !terminalInput.hasAttribute("data-has-listener")) {
    terminalInput.setAttribute("data-has-listener", "true");
    
    terminalInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const command = terminalInput.value.trim().toLowerCase();
        executeTerminalCommand(command);
        terminalInput.value = "";
      }
    });
    
    // Focus the input
    terminalInput.focus();
  }
  
  // Update mining status if running
  updateMiningStatus();
};

/**
 * Executes a command entered in the terminal
 * @param {string} command - The command to execute
 */
const executeTerminalCommand = (command) => {
  const terminalOutput = document.getElementById("terminal-output");
  if (!terminalOutput) return;
  
  // Add command to terminal output
  const commandLine = document.createElement("div");
  commandLine.className = "terminal-line";
  commandLine.innerHTML = `<span class="terminal-prompt">user@localhost:~$</span> ${command}`;
  terminalOutput.appendChild(commandLine);
  
  // Process command
  let responseText = "";
  
  switch (command) {
    case "help":
      responseText = `
Available commands:
  help        - Show this help message
  start       - Start the cryptocurrency miner
  stop        - Stop the cryptocurrency miner
  status      - Show miner status and earnings
  balance     - Check your current cryptocurrency balance
  clear       - Clear the terminal screen

Getting Started:
  1. Type 'start' to begin mining
  2. Mine until you have at least 25 CC
  3. Open the Upgrade Store from the taskbar
  4. Go to the Dark Forum to purchase your first target
  5. Return to the Hack Console to begin hacking
`;
      break;
      
    case "start":
      if (gameState.miner.isRunning) {
        responseText = '<span class="terminal-error">Error: Miner is already running.</span>';
      } else {
        startMiner();
        responseText = '<span class="terminal-status">Miner started successfully.</span>';
      }
      break;
      
    case "stop":
      if (!gameState.miner.isRunning) {
        responseText = '<span class="terminal-error">Error: Miner is not running.</span>';
      } else {
        stopMiner();
        responseText = '<span class="terminal-status">Miner stopped successfully.</span>';
      }
      break;
      
    case "status":
      if (gameState.miner.isRunning) {
        const uptime = calculateMinerUptime();
        responseText = `
<span class="terminal-status">Miner is running</span>
Hash rate: ${formatHashRate(gameState.miner.hashRate)}
Cryptocurrency mined: ${gameState.miner.totalMined.toFixed(2)} CC
Uptime: ${uptime}
`;
      } else {
        responseText = '<span class="terminal-status">Miner is not running.</span>';
      }
      break;
      
    case "clear":
      terminalOutput.innerHTML = `
<div class="terminal-line">Welcome to CryptoSurge Miner v1.3.8</div>
<div class="terminal-line">Type 'help' for available commands</div>
<div class="terminal-line">------------------------------------</div>
<div class="terminal-line terminal-status">GETTING STARTED:</div>
<div class="terminal-line">1. Type 'start' to begin mining cryptocurrency</div>
<div class="terminal-line">2. Earn at least 25 CC to buy your first target</div>
<div class="terminal-line">3. Open the Upgrade Store to access the Dark Web</div>
<div class="terminal-line">4. Navigate to the Dark Forum to purchase target access</div>
<div class="terminal-line">------------------------------------</div>
`;
      return; // Skip adding more output
      
    case "balance":
      responseText = `<span class="terminal-status">Current balance: ${gameState.cryptocurrency.toFixed(2)} CC</span>`;
      break;
      
    default:
      if (command !== "") {
        responseText = `<span class="terminal-error">Unknown command: ${command}</span>`;
      }
  }
  
  // Output response if any
  if (responseText) {
    const responseLines = responseText.trim().split('\n');
    responseLines.forEach(line => {
      const responseLine = document.createElement("div");
      responseLine.className = "terminal-line";
      responseLine.innerHTML = line;
      terminalOutput.appendChild(responseLine);
    });
  }
  
  // Auto-scroll to bottom
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
};

/**
 * Starts the personal cryptocurrency miner
 */
const startMiner = () => {
  if (gameState.miner.isRunning) return;
  
  gameState.miner.isRunning = true;
  gameState.miner.startTime = Date.now();
  gameState.miner.lastUpdateTime = Date.now();
  
  // Calculate hash rate based on user CPU/GPU
  updateMinerHashRate();
  
  // Show mining status
  const miningStatus = document.getElementById("mining-status");
  if (miningStatus) {
    miningStatus.style.display = "flex";
  }
  
  // Update status
  updateMiningStatus();
  
  // Simulate mining by periodically displaying hash outputs
  simulateMiningOutput();
};

/**
 * Stops the personal cryptocurrency miner
 */
const stopMiner = () => {
  if (!gameState.miner.isRunning) return;
  
  gameState.miner.isRunning = false;
  
  // Update status display
  const statusValue = document.getElementById("mining-status-value");
  if (statusValue) {
    statusValue.textContent = "STOPPED";
    statusValue.style.color = "#fc3";
  }
  
  // Add final status to terminal
  const terminalOutput = document.getElementById("terminal-output");
  if (terminalOutput) {
    const statusLine = document.createElement("div");
    statusLine.className = "terminal-line";
    statusLine.innerHTML = `<span class="terminal-status">Mining stopped. Total mined: ${gameState.miner.totalMined.toFixed(2)} CC</span>`;
    terminalOutput.appendChild(statusLine);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }
};

/**
 * Updates the hash rate based on current CPU/GPU power
 */
const updateMinerHashRate = () => {
  // Use settings from config
  const cpuBonus = gameState.userCPU * CONFIG.miner.cpuBoostPerPoint;
  const gpuBonus = gameState.userGPU * CONFIG.miner.gpuBoostPerPoint;
  
  gameState.miner.hashRate = gameState.miner.baseHashRate + cpuBonus + gpuBonus;
};

/**
 * Updates the mining status display in the UI
 */
const updateMiningStatus = () => {
  if (!uiState.windows.miner.isOpen) return;
  
  const statusValue = document.getElementById("mining-status-value");
  const hashRate = document.getElementById("mining-hashrate");
  const found = document.getElementById("mining-found");
  const uptime = document.getElementById("mining-uptime");
  
  if (statusValue && hashRate && found && uptime) {
    if (gameState.miner.isRunning) {
      statusValue.textContent = "MINING";
      statusValue.style.color = "#0c8";
      hashRate.textContent = formatHashRate(gameState.miner.hashRate);
      
      // Show progress toward the first purchase (25 CC)
      const progressText = gameState.cryptocurrency < 25 ? 
        ` (${Math.floor((gameState.cryptocurrency / 25) * 100)}% to first target)` : 
        '';
      found.textContent = `${gameState.miner.totalMined.toFixed(2)} CC${progressText}`;
      
      uptime.textContent = calculateMinerUptime();
    } else {
      statusValue.textContent = "IDLE";
      statusValue.style.color = "#aaa";
      hashRate.textContent = "0 H/s";
      uptime.textContent = "00:00:00";
    }
  }
};

/**
 * Calculates and formats the miner uptime
 * @returns {string} - Formatted uptime string (HH:MM:SS)
 */
const calculateMinerUptime = () => {
  if (!gameState.miner.isRunning || !gameState.miner.startTime) return "00:00:00";
  
  const uptime = Math.floor((Date.now() - gameState.miner.startTime) / 1000);
  const hours = Math.floor(uptime / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((uptime % 3600) / 60).toString().padStart(2, '0');
  const seconds = Math.floor(uptime % 60).toString().padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds}`;
};

/**
 * Formats a hash rate value with appropriate units
 * @param {number} rate - Hash rate to format
 * @returns {string} - Formatted hash rate string
 */
const formatHashRate = (rate) => {
  if (rate >= 1000) {
    return `${(rate / 1000).toFixed(2)} KH/s`;
  } else {
    return `${rate.toFixed(2)} H/s`;
  }
};

/**
 * Simulates mining output in the terminal
 * Recursive function that continues while mining is active
 */
const simulateMiningOutput = () => {
  if (!gameState.miner.isRunning || !uiState.windows.miner.isOpen) return;
  
  const terminalOutput = document.getElementById("terminal-output");
  if (!terminalOutput) return;
  
  // Generate random hash
  const hash = generateRandomHash();
  
  // Add hash line to terminal
  const hashLine = document.createElement("div");
  hashLine.className = "terminal-line";
  
  // Chance to find a block based on config
  const foundBlock = Math.random() < CONFIG.miner.blockFindChance;
  
  if (foundBlock) {
    // Calculate reward based on hash rate and config settings
    const baseReward = CONFIG.miner.blockRewardMin + 
                     (Math.random() * (CONFIG.miner.blockRewardMax - CONFIG.miner.blockRewardMin));
                     
    // Apply mining efficiency multiplier if it exists
    const miningMultiplier = gameState.miningEfficiencyMultiplier || 1.0;
    
    // Calculate final reward with both hash rate and efficiency multipliers
    const reward = baseReward * (1 + (gameState.miner.hashRate / 10)) * miningMultiplier;
    const roundedReward = Math.round(reward * 100) / 100;
    
    gameState.cryptocurrency += roundedReward;
    gameState.miner.totalMined += roundedReward;
    
    hashLine.innerHTML = `<span class="terminal-hash">${hash}</span> <span class="terminal-status">BLOCK FOUND!</span> <span class="terminal-status">+${roundedReward.toFixed(2)} CC</span>`;
    
    // Add transaction
    addTransaction(`Mined cryptocurrency`, roundedReward);
  } else {
    hashLine.innerHTML = `<span class="terminal-hash">${hash}</span>`;
  }
  
  terminalOutput.appendChild(hashLine);
  
  // Limit terminal output to max lines defined in config
  while (terminalOutput.children.length > CONFIG.miner.maxTerminalLines) {
    terminalOutput.removeChild(terminalOutput.firstChild);
  }
  
  // Auto-scroll to bottom
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
  
  // Schedule next output based on hash rate and config
  // Higher hash rate = more frequent updates
  const delay = Math.max(CONFIG.miner.simulationDelay, 2000 / gameState.miner.hashRate);
  setTimeout(simulateMiningOutput, delay);
};

/**
 * Generates a random cryptographic hash for display
 * @returns {string} - Random hash string
 */
const generateRandomHash = () => {
  const characters = "0123456789abcdef";
  let hash = "0x";
  
  for (let i = 0; i < 40; i++) {
    hash += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return hash;
};
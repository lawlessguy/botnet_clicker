/**
 * gameLogic.js
 * Contains core game mechanics and calculations
 */

/**
 * Selects a target device to hack
 * @param {number} targetId - ID of the device to select
 */
const selectTarget = (targetId) => {
  // If the clicked device is already selected, unselect it
  if (gameState.selectedTargetId === targetId) {
    gameState.selectedTargetId = null;
    // Reset hacking state
    gameState.hacking.isActive = false;
  } else {
    // Otherwise, select the new device
    gameState.selectedTargetId = targetId;
    
    // Hide error message when a target is selected
    const errorElement = document.getElementById("hack-error");
    if (errorElement) {
      errorElement.style.display = "none";
    }
  }
  
  // Update the password display to reflect the new selection state
  updatePasswordDisplay();
  
  updateHackConsole();
};

/**
 * Finds the next available target for hacking
 * @returns {number|null} - ID of next target or null if none available
 */
const findNextAvailableTarget = () => {
  // Look for purchased and uncompromised devices
  const nextTargets = allDevices.filter(device => device.isPurchased && !device.isCompromised);
  
  // Return the first available target, or null if none found
  return nextTargets.length > 0 ? nextTargets[0].id : null;
};

/**
 * Generates a random password for display
 * @returns {string} - The generated password
 */
const generateRandomPassword = () => {
  // Get character sets from config
  const { lowercase, uppercase, numbers, symbols } = PASSWORD_CONFIG.characterSets;
  const { commonWords, specialDates } = PASSWORD_CONFIG;
  const patterns = PASSWORD_CONFIG.patterns;
  
  // Use word-based pattern if random number is less than wordBasedChance
  if (Math.random() < patterns.wordBasedChance) {
    // Select 1-2 random words
    const word1 = commonWords[Math.floor(Math.random() * commonWords.length)];
    const useSecondWord = Math.random() < patterns.secondWordChance;
    let word2 = "";
    
    if (useSecondWord) {
      word2 = commonWords[Math.floor(Math.random() * commonWords.length)];
    }
    
    // Add numbers/symbols based on config chances
    const addSuffix = Math.random() < patterns.suffixChance;
    let suffix = "";
    
    if (addSuffix) {
      suffix = specialDates[Math.floor(Math.random() * specialDates.length)];
    }
    
    // Add symbol based on config chance
    const addSymbol = Math.random() < patterns.symbolChance;
    let symbolChar = "";
    
    if (addSymbol) {
      symbolChar = symbols[Math.floor(Math.random() * symbols.length)];
    }
    
    // Capitalize first letter based on config chance
    let result = word1;
    if (Math.random() < patterns.capitalizeChance) {
      result = word1.charAt(0).toUpperCase() + word1.slice(1);
    }
    
    if (useSecondWord) {
      result += word2;
    }
    
    result += suffix;
    
    if (addSymbol) {
      result += symbolChar;
    }
    
    return result;
  } else {
    // Generate a completely random password using config
    const length = patterns.randomLength.min + 
                   Math.floor(Math.random() * (patterns.randomLength.max - patterns.randomLength.min + 1));
    
    let password = "";
    const allChars = lowercase + uppercase + numbers;
    
    for (let i = 0; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Add a symbol at the end based on config chance
    if (Math.random() < patterns.endSymbolChance) {
      password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    }
    
    return password;
  }
};

/**
 * Updates the password display in the UI
 * @param {boolean} forceUpdate - Whether to force an update regardless of hacking state
 */
const updatePasswordDisplay = (forceUpdate = false) => {
  const passwordDisplay = document.getElementById("current-password");
  if (!passwordDisplay) return;
  
  // Only change the password if actual hacking is happening
  // or if we're force updating (like when clicking the hack button)
  if (gameState.hacking.isActive || forceUpdate) {
    passwordDisplay.textContent = generateRandomPassword();
    gameState.hacking.attemptsMade++;
  } else if (gameState.selectedTargetId === null) {
    // Reset to waiting message if no target is selected
    passwordDisplay.textContent = "Waiting to start...";
  }
};

/**
 * Handles a manual hack attempt button click
 */
const clickHack = () => {
  if (gameState.selectedTargetId === null) {
    const errorElement = document.getElementById("hack-error");
    if (errorElement) {
      errorElement.style.display = "block";
    }
    
    // Create error notification
    createNotification("Error", "No target selected. Please select a machine first.", "error-notification");
    
    return;
  }
  
  const errorElement = document.getElementById("hack-error");
  if (errorElement) {
    errorElement.style.display = "none";
  }
  
  // Set hacking as active
  gameState.hacking.isActive = true;
  gameState.hacking.lastProgressUpdate = Date.now();
  
  // Generate and display a new password (force update)
  updatePasswordDisplay(true);
  
  // Get the selected device
  const device = allDevices.find(d => d.id === gameState.selectedTargetId);
  
  if (!device) return;
  
  // Check for instant crack if the upgrade is purchased and device has no progress yet
  const instantCrackUpgrades = upgradeDefinitions.filter(u => u.effectType === "instantCrack" && u.purchased);
  if (instantCrackUpgrades.length > 0 && device.currentProgress === 0) {
    // Use the highest value instant crack upgrade
    const bestInstantCrack = instantCrackUpgrades.reduce((best, current) => 
      current.effectValue > best.effectValue ? current : best, instantCrackUpgrades[0]);
    
    // Generate a random number between 0 and 1
    const roll = Math.random();
    console.log(`Instant crack check: rolled ${roll}, need < ${bestInstantCrack.effectValue}`);
    
    // If roll is below the chance threshold, instantly crack the device
    if (roll < bestInstantCrack.effectValue) {
      const hackingEfficiency = calculateHackingEfficiency(device);
      const requiredAttempts = device.requiredAttempts * hackingEfficiency;
      device.currentProgress = requiredAttempts; // Set to exact required amount
      createNotification("Instant Crack!", `Password database hit! ${device.name} instantly compromised.`, "upgrade-purchased");
      
      // Mark as compromised immediately
      device.isCompromised = true;
      
      // Find and select the next available target
      gameState.selectedTargetId = findNextAvailableTarget();
      
      // Update displays
      updateHackConsole();
      updateBotnetControl();
      updatePerformanceWindow();
      
      // Force refresh the botnet panel
      triggerBotnetRefresh();
      
      return; // Exit function early since device is already compromised
    }
  }
  
  // Get the current click PA amount (affected by upgrades)
  const clickPaAmount = gameState.clickPaAmount || CLICK_PA_AMOUNT;
  
  // Add hacking attempts to the device
  device.currentProgress += clickPaAmount;
  gameState.totalPAThisRun += clickPaAmount;
  gameState.hacking.progressCounter += clickPaAmount;
  
  // Check if device is now compromised
  const hackingEfficiency = calculateHackingEfficiency(device);
  const requiredAttempts = device.requiredAttempts * hackingEfficiency;
  
  if (device.currentProgress >= requiredAttempts) {
    // Mark as compromised
    device.isCompromised = true;
    
    // Ensure progress is exactly at required attempts for clean UI display
    device.currentProgress = requiredAttempts;
    
    // Reset hacking state
    gameState.hacking.isActive = false;
    
    createNotification("Target Compromised", `${device.name} has been added to your botnet!`, "machine-compromised");
    
    // Find and select the next available target
    gameState.selectedTargetId = findNextAvailableTarget();
    
    // Update displays
    updateHackConsole();
    updateBotnetControl();
    updatePerformanceWindow();
    
    // Force refresh the botnet panel by ensuring it's updated
    triggerBotnetRefresh();
  } else {
    // Just update the progress bar
    updateHackProgress();
  }
};

/**
 * Installs a miner on a compromised device
 * @param {number} deviceId - ID of the device to install miner on
 */
const installMiner = (deviceId) => {
  const device = allDevices.find(d => d.id === deviceId);
  if (device && device.isCompromised && !device.hasMiner) {
    device.hasMiner = true;
    
    // Add a transaction for the miner installation
    addTransaction(`${device.name} miner online`, device.gpuPower.toFixed(1));
    
    createNotification("Miner Installed", `Crypto miner successfully installed on ${device.name}.`, "upgrade-purchased");
    
    // Update displays
    updateBotnetControl();
    updateResourceRates();
    updatePerformanceWindow();
    
    // Force refresh the botnet panel by ensuring it's updated
    triggerBotnetRefresh();
  }
};

/**
 * Purchases an upgrade
 * @param {number} upgradeId - ID of the upgrade to purchase
 */
const buyUpgrade = (upgradeId) => {
  const upgrade = upgradeDefinitions.find(u => u.id === upgradeId);
  
  if (upgrade && !upgrade.purchased) {
    // Check if player has enough cryptocurrency
    if (gameState.cryptocurrency < upgrade.costCC) {
      createNotification("Insufficient Funds", "You don't have enough cryptocurrency for this upgrade.", "error-notification");
      return;
    }
    
    // Check requirements
    const totalCPU = calculateTotalCPU();
    const totalGPU = calculateTotalGPU();
    
    if (totalCPU < upgrade.cpuRequirement || totalGPU < upgrade.gpuRequirement) {
      createNotification("Requirements Not Met", "Your botnet doesn't meet the requirements for this upgrade.", "error-notification");
      return;
    }
    
    // Purchase the upgrade
    gameState.cryptocurrency -= upgrade.costCC;
    upgrade.purchased = true;
    
    // For hacking efficiency upgrades, mark only currently purchased uncompromised devices
    if (upgrade.effectType === "hackingEfficiency") {
      // Get all devices that are purchased but not compromised (in the Hack Console)
      const uncompromisedDevices = allDevices.filter(d => d.isPurchased && !d.isCompromised);
      
      // Add the upgrade ID to each device's appliedEfficiencyUpgrades array
      uncompromisedDevices.forEach(device => {
        // Initialize the array if it doesn't exist
        if (!device.appliedEfficiencyUpgrades) {
          device.appliedEfficiencyUpgrades = [];
        }
        
        // Add this upgrade to the device
        device.appliedEfficiencyUpgrades.push(upgrade.id);
        console.log(`Applied efficiency upgrade ${upgrade.id} to device ${device.name}`);
      });
      
      // Log how many devices received the upgrade
      console.log(`Applied efficiency upgrade ${upgrade.name} to ${uncompromisedDevices.length} devices`);
    }
    
    // Add transaction
    addTransaction(`Purchased ${upgrade.name}`, -upgrade.costCC);
    
    createNotification("Upgrade Purchased", `Successfully purchased: ${upgrade.name}`, "upgrade-purchased");
    
    // Apply upgrade effects
    applyUpgradeEffect(upgrade);
    
    // Update all relevant displays
    updateAllWindows();
  }
};

/**
 * Applies the effect of a purchased upgrade
 * @param {object} upgrade - The upgrade object to apply
 */
const applyUpgradeEffect = (upgrade) => {
  switch (upgrade.effectType) {
    case "userCPU":
      gameState.userCPU += upgrade.effectValue;
      break;
    case "userGPU":
      gameState.userGPU += upgrade.effectValue;
      // Force update miner hash rate when GPU is upgraded
      if (gameState.miner.isRunning) {
        updateMinerHashRate();
      }
      break;
    case "hackingEfficiency":
      // This is now handled per-device based on appliedEfficiencyUpgrades
      break;
    case "botnetBoost":
      // This is handled in calculateBotnetMultiplier()
      break;
    case "botnetMultiplier":
      // This is handled in calculateBotnetMultiplier()
      break;
    case "instantCrack":
      // This is checked when clicking hack
      break;
    case "clickEfficiency":
      // Update the clickPaAmount with the correct value
      gameState.clickPaAmount = upgrade.effectValue;
      break;
    case "miningEfficiency":
      // This affects mining rewards
      gameState.miningEfficiencyMultiplier = upgrade.effectValue;
      break;
  }
};

/**
 * Calculates the hacking efficiency based on upgrades
 * @param {object} device - The device to calculate efficiency for
 * @returns {number} - Efficiency multiplier (lower is better)
 */
const calculateHackingEfficiency = (device) => {
  let efficiency = 1;
  
  // If no device provided, use the general efficiency calculation
  if (!device) {
    // Apply ALL efficiency upgrades
    const efficiencyUpgrades = upgradeDefinitions.filter(u => 
      u.effectType === "hackingEfficiency" && u.purchased);
    
    // Apply each purchased efficiency upgrade
    for (const upgrade of efficiencyUpgrades) {
      efficiency -= upgrade.effectValue;
    }
  } else {
    // Use the device-specific efficiency calculation
    
    // If the device doesn't have the array, create it
    if (!device.appliedEfficiencyUpgrades) {
      device.appliedEfficiencyUpgrades = [];
    }
    
    // Apply only the efficiency upgrades stored in the device's appliedEfficiencyUpgrades array
    for (const upgradeId of device.appliedEfficiencyUpgrades) {
      const upgrade = upgradeDefinitions.find(u => u.id === upgradeId);
      if (upgrade && upgrade.purchased) {
        efficiency -= upgrade.effectValue;
      }
    }
  }
  
  // Ensure efficiency doesn't go below some minimum value (e.g., 0.1)
  return Math.max(0.1, efficiency);
};

/**
 * Calculates the botnet performance multiplier
 * @returns {number} - The multiplier value
 */
const calculateBotnetMultiplier = () => {
  let multiplier = 1;
  
  // Apply ALL botnet boost upgrades, not just specific IDs
  const boostUpgrades = upgradeDefinitions.filter(u => 
    u.effectType === "botnetBoost" && u.purchased);
  
  // Apply each purchased boost upgrade - ADD to the multiplier (not set it)
  for (const upgrade of boostUpgrades) {
    multiplier += upgrade.effectValue; // ADD the boost percentage (not multiply)
  }
  
  // Apply ALL botnet multiplier upgrades
  const multiplierUpgrades = upgradeDefinitions.filter(u => 
    u.effectType === "botnetMultiplier" && u.purchased);
  
  // Apply each purchased multiplier upgrade - MULTIPLY the result
  for (const upgrade of multiplierUpgrades) {
    multiplier *= upgrade.effectValue;
  }
  
  // Apply master key tokens
  multiplier *= (1 + (gameState.masterKeyTokens * 0.1)); // +10% per token
  
  return multiplier;
};

/**
 * Calculates total CPU power available
 * @returns {number} - Total CPU power
 */
const calculateTotalCPU = () => {
  // Sum up CPU from compromised devices
  const botnetCPU = allDevices
    .filter(device => device.isCompromised)
    .reduce((sum, device) => sum + device.cpuPower, 0);
  
  return botnetCPU + gameState.userCPU;
};

/**
 * Calculates total GPU power available
 * @returns {number} - Total GPU power
 */
const calculateTotalGPU = () => {
  // Sum up GPU from compromised devices with miners
  const botnetGPU = allDevices
    .filter(device => device.isCompromised && device.hasMiner)
    .reduce((sum, device) => sum + device.gpuPower, 0);
  
  return botnetGPU + gameState.userGPU;
};

/**
 * Calculates resource generation rates
 * @returns {object} - Object containing all calculated rates
 */
const calculateResourceRates = () => {
  // Calculate boosts
  const botnetMultiplier = calculateBotnetMultiplier();
  
  // Calculate CPU power for Password Attempts
  const botnetCPU = allDevices
    .filter(device => device.isCompromised)
    .reduce((sum, device) => sum + device.cpuPower, 0);
  
  const totalPAPerSecond = (botnetCPU + gameState.userCPU) * botnetMultiplier;
  
  // Calculate GPU power for Cryptocurrency
  const botnetGPU = allDevices
    .filter(device => device.isCompromised && device.hasMiner)
    .reduce((sum, device) => sum + device.gpuPower, 0);
  
  const totalCCPerSecond = (botnetGPU + gameState.userGPU) * botnetMultiplier;
  
  // Update game state
  gameState.passwordAttemptsPerSecond = totalPAPerSecond;
  gameState.cryptocurrencyPerSecond = totalCCPerSecond;
  
  return {
    paPerSecond: totalPAPerSecond,
    ccPerSecond: totalCCPerSecond,
    botnetCPU,
    botnetGPU,
    userPA: gameState.userCPU * botnetMultiplier,
    userCC: gameState.userGPU * botnetMultiplier
  };
};

/**
 * Records a transaction in the game state
 * @param {string} description - Description of the transaction
 * @param {number|string} amount - Amount of cryptocurrency or descriptive text
 */
const addTransaction = (description, amount) => {
  gameState.transactions.push({
    description,
    amount,
    timestamp: Date.now()
  });
  
  if (uiState.windows.cryptoWallet.isOpen) {
    updateWalletWindow();
  }
};

/**
 * Forces the botnet control panel to refresh
 */
const triggerBotnetRefresh = () => {
  if (!uiState.windows.botnetControl.isOpen) return;
  
  // Directly re-render the entire botnet panel content
  const botnetWindow = document.getElementById('botnet-control-window');
  if (botnetWindow) {
    // First try to update using the standard method
    updateBotnetControl();
    
    // Extra fail-safe: In case the machine-list wasn't properly reset
    setTimeout(() => {
      updateBotnetControl();
    }, 50);
  }
};

/**
 * Creates a notification to display to the user
 * @param {string} title - Title of the notification
 * @param {string} message - Message content
 * @param {string} type - CSS class for styling
 */
const createNotification = (title, message, type = "") => {
  const notificationContainer = document.getElementById("notification-container");
  
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-title">${title}</div>
    <div class="notification-message">${message}</div>
  `;
  
  notificationContainer.appendChild(notification);
  
  // Remove notification after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
};

/**
 * Purchases device access in the dark forum
 * @param {number} deviceId - ID of the device to purchase
 */
const purchaseDevice = (deviceId) => {
  const device = allDevices.find(d => d.id === deviceId);
  
  if (device && !device.isPurchased) {
    // Check if player has enough cryptocurrency
    if (gameState.cryptocurrency < device.costCC) {
      createNotification("Insufficient Funds", "You don't have enough cryptocurrency to purchase this target.", "error-notification");
      return;
    }
    
    // Purchase the device
    gameState.cryptocurrency -= device.costCC;
    device.isPurchased = true;
    
    // Initialize the appliedEfficiencyUpgrades array (will be empty for new devices)
    if (!device.appliedEfficiencyUpgrades) {
      device.appliedEfficiencyUpgrades = [];
    }
    
    // Add transaction
    addTransaction(`Purchased access to ${device.name}`, -device.costCC);
    
    createNotification("Access Purchased", `You now have access to hack ${device.name}!`, "upgrade-purchased");
    
    // Update all relevant displays
    updateAllWindows();
    
    // If this is the first/only available target, select it automatically
    if (gameState.selectedTargetId === null) {
      gameState.selectedTargetId = device.id;
      updateHackConsole();
    }
  }
};

/**
 * Performs a prestige reset, keeping permanent progress
 */
const prestigeReset = () => {
  if (gameState.totalPAThisRun >= PRESTIGE_THRESHOLD) {
    // Stop mining if it's running
    if (gameState.miner.isRunning) {
      stopMiner();
    }
    
    // Calculate tokens to award
    const tokensToAward = 1; // For simplicity, award 1 token per prestige
    
    // Reset game state
    const previousTokens = gameState.masterKeyTokens;
    
    // Save tokens and restore minimal state
    gameState.masterKeyTokens = previousTokens + tokensToAward;
    gameState.selectedTargetId = null;
    gameState.passwordAttempts = 0;
    gameState.cryptocurrency = 0;
    gameState.userCPU = 0;
    gameState.userGPU = 0;
    gameState.totalPAThisRun = 0;
    gameState.pausedHackingProgress = {};
    gameState.transactions = [];
    
    // Reset miner statistics
    gameState.miner.totalMined = 0;
    
    // Reset all devices
    allDevices.forEach(device => {
      device.isCompromised = false;
      device.currentProgress = 0;
      device.hasMiner = false;
      
      // Clear efficiency upgrades when resetting
      device.appliedEfficiencyUpgrades = [];
      
      // Reset purchase status
      device.isPurchased = false;
    });
    
    // Reset all upgrades
    upgradeDefinitions.forEach(upgrade => {
      upgrade.purchased = false;
    });
    
    // Add transaction for prestige
    addTransaction("Global Master Key Activated", "+1 Master Key Token");
    
    createNotification("Prestige Complete", `You've activated the Global Master Key and gained a token! Your botnet has been reset but with a permanent ${(tokensToAward * 10)}% boost.`, "upgrade-purchased");
    
    // Update all windows
    updateAllWindows();
  }
};
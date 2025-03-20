/**
 * uiManager.js
 * Handles updating UI elements based on game state
 */

/**
 * Updates the Hack Console UI
 */
const updateHackConsole = () => {
  const targetList = document.getElementById("target-list");
  if (!targetList) return;
  
  targetList.innerHTML = "";
  
  // Get purchased and uncompromised devices only
  const hackableDevices = allDevices.filter(device => device.isPurchased && !device.isCompromised);
  

  // Add each device to the list
  hackableDevices.forEach(device => {
    const adjustedRequired = Math.ceil(device.requiredAttempts * gameState.hackingEfficiency);
    
    const deviceElement = document.createElement("div");
    deviceElement.className = `target-item ${device.id === gameState.selectedTargetId ? "selected" : ""}`;
    deviceElement.innerHTML = `
      <div>${device.name}</div>
      <div>${adjustedRequired} PA</div>
    `;
    
    deviceElement.addEventListener("click", () => {
      selectTarget(device.id);
    });
    
    targetList.appendChild(deviceElement);
  });
  
  // Update progress bar and labels
  updateHackProgress();
  
  // Update stats
  const resourceRates = calculateResourceRates();
  const currentPaElement = document.getElementById("current-pa");
  const paPerSecondElement = document.getElementById("pa-per-second");
  const ccPerSecondElement = document.getElementById("cc-per-second");
  
  if (currentPaElement) currentPaElement.textContent = Math.floor(gameState.passwordAttempts);
  if (paPerSecondElement) paPerSecondElement.textContent = resourceRates.paPerSecond.toFixed(1);
  if (ccPerSecondElement) ccPerSecondElement.textContent = resourceRates.ccPerSecond.toFixed(1);
  
  // Set a password in the display appropriate to the current state
  updatePasswordDisplay();
  
  // If there are no more purchased uncompromised devices, notify the user
  if (hackableDevices.length === 0) {
    const noDevicesElement = document.createElement("div");
    noDevicesElement.className = "target-item";
    noDevicesElement.innerHTML = `<div class="no-targets">No available targets. Purchase more from the Dark Web!</div>`;
    targetList.appendChild(noDevicesElement);
  }
};

/**
 * Updates the hacking progress bar and label
 */
const updateHackProgress = () => {
  const progressBar = document.getElementById("hack-progress");
  const progressLabel = document.getElementById("progress-label");
  
  if (!progressBar || !progressLabel) return;
  
  if (gameState.selectedTargetId === null) {
    progressBar.style.width = "0%";
    progressLabel.textContent = "Select a target to start hacking";
    return;
  }
  
  const selectedDevice = allDevices.find(d => d.id === gameState.selectedTargetId);
  
  if (selectedDevice) {
    // Calculate hacking efficiency
    const adjustedRequired = Math.ceil(selectedDevice.requiredAttempts * gameState.hackingEfficiency);
    const currentProgress = Math.floor(selectedDevice.currentProgress);
    
    const progressPercent = (selectedDevice.currentProgress / adjustedRequired) * 100;
    progressBar.style.width = `${progressPercent}%`;
    progressLabel.textContent = `Hacking Progress: ${currentProgress} / ${adjustedRequired} PA`;
  }
};

/**
 * Updates the Botnet Control Panel UI
 */
const updateBotnetControl = () => {
  const machineList = document.getElementById("machine-list");
  const noMachinesMessage = document.getElementById("no-machines-message");
  
  if (!machineList) {
    console.error("Machine list element not found");
    return;
  }
  
  if (!noMachinesMessage) {
    // Create the no machines message if it doesn't exist
    const newNoMachinesMessage = document.createElement("div");
    newNoMachinesMessage.id = "no-machines-message";
    newNoMachinesMessage.className = "no-machines-message";
    newNoMachinesMessage.innerText = "No machines compromised yet. Start hacking!";
    machineList.appendChild(newNoMachinesMessage);
  }
  
  // Get compromised devices
  const compromisedDevices = allDevices.filter(device => device.isCompromised);
  
  if (compromisedDevices.length === 0) {
    if (noMachinesMessage) noMachinesMessage.style.display = "block";
    machineList.innerHTML = ""; // Clear any existing items
    
    // Re-add the no machines message
    const newNoMachinesMessage = document.createElement("div");
    newNoMachinesMessage.id = "no-machines-message";
    newNoMachinesMessage.className = "no-machines-message";
    newNoMachinesMessage.innerText = "No machines compromised yet. Start hacking!";
    machineList.appendChild(newNoMachinesMessage);
    return;
  }
  
  // Clear the list completely
  machineList.innerHTML = "";
  
  // Add each compromised device to the list
  compromisedDevices.forEach(device => {
    const machineElement = document.createElement("div");
    machineElement.className = "machine-item";
    
    machineElement.innerHTML = `
      <div class="machine-header">
        <div class="machine-name">${device.name}</div>
        <div class="machine-status ${device.hasMiner ? "mining" : ""}">${device.hasMiner ? "Mining" : "Idle"}</div>
      </div>
      <div class="machine-stats">
        <div>CPU: ${device.cpuPower} PA/s</div>
        <div>GPU: ${device.gpuPower} CC/s</div>
      </div>
      ${!device.hasMiner ? `<button class="install-miner" data-device-id="${device.id}">Install Miner</button>` : ""}
    `;
    
    machineList.appendChild(machineElement);
  });
  
  // Add event listeners to install miner buttons
  document.querySelectorAll(".install-miner").forEach(button => {
    button.addEventListener("click", () => {
      const deviceId = parseInt(button.getAttribute("data-device-id"));
      installMiner(deviceId);
    });
  });
};

/**
 * Updates the Crypto Wallet window UI
 */
const updateWalletWindow = () => {
  const cryptoBalance = document.getElementById("crypto-balance");
  const transactionLog = document.getElementById("transaction-log");
  
  if (!cryptoBalance || !transactionLog) return;
  
  cryptoBalance.textContent = `${gameState.cryptocurrency.toFixed(1)} CC`;
  
  // Update transaction log
  transactionLog.innerHTML = "";
  
  // Display last 10 transactions in reverse order (newest first)
  const recentTransactions = [...gameState.transactions].reverse().slice(0, 10);
  
  recentTransactions.forEach(transaction => {
    const transactionElement = document.createElement("div");
    transactionElement.className = "transaction-item";
    
    const amountClass = typeof transaction.amount === "number" ? 
      (transaction.amount >= 0 ? "positive" : "") : "";
    
    transactionElement.innerHTML = `
      <div>${transaction.description}</div>
      <div class="transaction-amount ${amountClass}">${
        typeof transaction.amount === "number" ? 
          (transaction.amount >= 0 ? "+" : "") + transaction.amount.toFixed(1) + " CC" : 
          transaction.amount
      }</div>
    `;
    
    transactionLog.appendChild(transactionElement);
  });
};

/**
 * Updates the System Performance window UI
 */
const updatePerformanceWindow = () => {
  // Update user machine stats
  const userCpuElement = document.getElementById("user-cpu");
  const userGpuElement = document.getElementById("user-gpu");
  
  if (userCpuElement) userCpuElement.textContent = gameState.userCPU;
  if (userGpuElement) userGpuElement.textContent = gameState.userGPU;
  
  // Calculate resource rates
  const resourceRates = calculateResourceRates();
  const botnetMultiplier = gameState.totalBotMulti;
  console.log(botnetMultiplier);
  
  // Update PA breakdown
  const botnetPaElement = document.getElementById("botnet-pa");
  const userPaElement = document.getElementById("user-pa");
  const paMultiplierElement = document.getElementById("pa-multiplier");
  const totalPaRateElement = document.getElementById("total-pa-rate");
  
  if (botnetPaElement) botnetPaElement.textContent = resourceRates.botnetCPU.toFixed(1);
  if (userPaElement) userPaElement.textContent = resourceRates.userPA.toFixed(1);
  if (paMultiplierElement) paMultiplierElement.textContent = `x${botnetMultiplier.toFixed(1)}`;
  if (totalPaRateElement) totalPaRateElement.textContent = resourceRates.paPerSecond.toFixed(1);
  
  // Update CC breakdown
  const botnetCcElement = document.getElementById("botnet-cc");
  const userCcElement = document.getElementById("user-cc");
  const ccMultiplierElement = document.getElementById("cc-multiplier");
  const totalCcRateElement = document.getElementById("total-cc-rate");
  
  if (botnetCcElement) botnetCcElement.textContent = resourceRates.botnetGPU.toFixed(1);
  if (userCcElement) userCcElement.textContent = resourceRates.userCC.toFixed(1);
  if (ccMultiplierElement) ccMultiplierElement.textContent = `x${botnetMultiplier.toFixed(1)}`;
  if (totalCcRateElement) totalCcRateElement.textContent = resourceRates.ccPerSecond.toFixed(1);
  
  // Update prestige progress
  const prestigeProgress = document.getElementById("prestige-progress");
  const prestigeValue = document.getElementById("prestige-value");
  const masterKeyTokens = document.getElementById("master-key-tokens");
  const masterKeyMultiplier = document.getElementById("master-key-multiplier");
  const prestigeButton = document.getElementById("prestige-button");
  
  if (prestigeProgress && prestigeValue && masterKeyTokens && masterKeyMultiplier && prestigeButton) {
    const progressPercent = Math.min((gameState.totalPAThisRun / PRESTIGE_THRESHOLD) * 100, 100);
    prestigeProgress.style.width = `${progressPercent}%`;
    prestigeValue.textContent = `${gameState.totalPAThisRun.toLocaleString()} / ${PRESTIGE_THRESHOLD.toLocaleString()} PA`;
    
    masterKeyTokens.textContent = gameState.masterKeyTokens;
    masterKeyMultiplier.textContent = `x${(1 + (gameState.masterKeyTokens * 0.1)).toFixed(1)}`;
    
    // Enable prestige button if threshold reached
    if (gameState.totalPAThisRun >= PRESTIGE_THRESHOLD) {
      prestigeButton.disabled = false;
    } else {
      prestigeButton.disabled = true;
    }
  }
};

/**
 * Updates the resource rates displayed in the taskbar
 */
const updateResourceRates = () => {
  // Calculate resource rates
  const resourceRates = calculateResourceRates();
  
  // Update taskbar stats
  const taskbarPaElement = document.getElementById("taskbar-pa");
  const taskbarCcElement = document.getElementById("taskbar-cc");
  
  if (taskbarPaElement) taskbarPaElement.textContent = `PA/s: ${resourceRates.paPerSecond.toFixed(1)}`;
  if (taskbarCcElement) taskbarCcElement.textContent = `CC/s: ${resourceRates.ccPerSecond.toFixed(1)}`;
  
  // Update hack console if open
  if (uiState.windows.hackConsole.isOpen) {
    const paPerSecondElement = document.getElementById("pa-per-second");
    const ccPerSecondElement = document.getElementById("cc-per-second");
    
    if (paPerSecondElement) paPerSecondElement.textContent = resourceRates.paPerSecond.toFixed(1);
    if (ccPerSecondElement) ccPerSecondElement.textContent = resourceRates.ccPerSecond.toFixed(1);
  }
};

/**
 * Updates the Settings window UI
 */
const updateSettingsWindow = () => {
  // Update save code
  const saveCodeElement = document.getElementById("save-code");
  if (saveCodeElement) {
    saveCodeElement.value = generateSaveString();
  }
  
  // Update prestige information
  const prestigeProgressElement = document.getElementById("settings-prestige-progress");
  const prestigeValueElement = document.getElementById("settings-prestige-value");
  const masterKeyTokensElement = document.getElementById("settings-master-key-tokens");
  const masterKeyMultiplierElement = document.getElementById("settings-master-key-multiplier");
  const prestigeButtonElement = document.getElementById("settings-prestige-button");
  
  if (prestigeProgressElement && prestigeValueElement && masterKeyTokensElement && 
      masterKeyMultiplierElement && prestigeButtonElement) {
    // Update prestige progress
    const progressPercent = Math.min((gameState.totalPAThisRun / PRESTIGE_THRESHOLD) * 100, 100);
    prestigeProgressElement.style.width = `${progressPercent}%`;
    
    // Format numbers with commas
    const formattedTotal = gameState.totalPAThisRun.toLocaleString();
    const formattedThreshold = PRESTIGE_THRESHOLD.toLocaleString();
    prestigeValueElement.textContent = `${formattedTotal} / ${formattedThreshold} PA`;
    
    // Update token information
    masterKeyTokensElement.textContent = gameState.masterKeyTokens;
    masterKeyMultiplierElement.textContent = `x${(1 + (gameState.masterKeyTokens * 0.1)).toFixed(1)}`;
    
    // Enable/disable prestige button
    prestigeButtonElement.disabled = gameState.totalPAThisRun < PRESTIGE_THRESHOLD;
  }
  
  // Add event listeners if not already added
  const copyButtonElement = document.getElementById("copy-save");
  const importSaveButtonElement = document.getElementById("import-save");
  const prestigeButtonElement2 = document.getElementById("settings-prestige-button");
  
  if (copyButtonElement && !copyButtonElement.hasAttribute("data-has-listener")) {
    copyButtonElement.setAttribute("data-has-listener", "true");
    copyButtonElement.addEventListener("click", () => {
      const saveCodeElement = document.getElementById("save-code");
      if (saveCodeElement) {
        saveCodeElement.select();
        try {
          // Execute copy command
          document.execCommand("copy");
          createNotification("Code Copied", "Save code copied to clipboard", "upgrade-purchased");
        } catch (err) {
          console.error("Could not copy text: ", err);
          createNotification("Error", "Failed to copy to clipboard", "error-notification");
        }
      }
    });
  }
  
  if (importSaveButtonElement && !importSaveButtonElement.hasAttribute("data-has-listener")) {
    importSaveButtonElement.setAttribute("data-has-listener", "true");
    importSaveButtonElement.addEventListener("click", () => {
      const importCodeElement = document.getElementById("import-code");
      if (importCodeElement && importCodeElement.value.trim()) {
        loadSaveString(importCodeElement.value.trim());
      } else {
        createNotification("Error", "No save code provided", "error-notification");
      }
    });
  }
  
  if (prestigeButtonElement2 && !prestigeButtonElement2.hasAttribute("data-has-listener")) {
    prestigeButtonElement2.setAttribute("data-has-listener", "true");
    prestigeButtonElement2.addEventListener("click", () => {
      prestigeReset();
      updateSettingsWindow();
    });
  }
};

/**
 * Updates all UI windows based on current game state
 */
const updateAllWindows = () => {
  // Update all open windows
  if (uiState.windows.hackConsole.isOpen) updateHackConsole();
  if (uiState.windows.botnetControl.isOpen) updateBotnetControl();
  if (uiState.windows.cryptoWallet.isOpen) updateWalletWindow();
  if (uiState.windows.upgradeStore.isOpen) {
    // Refresh the browser content
    const addressBar = document.getElementById("address-bar");
    if (addressBar) {
      const currentPage = addressBar.textContent.split('/').pop();
      navigateBrowser(currentPage);
    }
  }
  if (uiState.windows.systemPerformance.isOpen) updatePerformanceWindow();
  if (uiState.windows.settings.isOpen) updateSettingsWindow();
  
  // Always update resource rates in the taskbar
  updateResourceRates();
};
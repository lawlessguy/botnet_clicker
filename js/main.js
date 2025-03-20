/**
 * main.js
 * Main entry point for the game, contains initialization and game loop
 */

/**
 * Main game loop that updates game state and UI
 */
const gameLoop = () => {
  const now = Date.now();
  const deltaTime = (now - gameState.lastTimestamp) / 1000; // in seconds
  gameState.lastTimestamp = now;
  
  // Add passive resources
  if (gameState.selectedTargetId !== null) {
    const selectedDevice = allDevices.find(d => d.id === gameState.selectedTargetId);
    if (selectedDevice && !selectedDevice.isCompromised) {
      // Reset active hacking flag at the beginning of each cycle
      gameState.hacking.isActive = false;
      
      // Only count as active hacking if we're actually making progress
      if (gameState.passwordAttemptsPerSecond > 0) {
        // Calculate progress increase this cycle
        const progressIncrease = gameState.passwordAttemptsPerSecond * deltaTime;
        
        if (progressIncrease > 0) {
          // Add password attempts to the selected target
          selectedDevice.currentProgress += progressIncrease;
          gameState.totalPAThisRun += progressIncrease;
          
          // Track progress increase in the counter
          gameState.hacking.progressCounter += progressIncrease;
          
          // Mark hacking as active since progress was made
          gameState.hacking.isActive = true;
          
          // Update the password display based on progress counter
          // This ensures password updates match exactly the rate of hacking progress
          if (uiState.windows.hackConsole.isOpen) {
            // Calculate how many full attempts have been made
            const newAttemptsMade = Math.floor(gameState.hacking.progressCounter);
            
            // If we've completed at least one new full attempt, update the password
            // This ties password updates directly to progress increases
            if (newAttemptsMade > gameState.hacking.attemptsMade) {
              updatePasswordDisplay();
              // Reset the counter partially to track fractional attempts
              gameState.hacking.progressCounter -= (newAttemptsMade - gameState.hacking.attemptsMade);
              gameState.hacking.attemptsMade = newAttemptsMade;
            }
          }
        }
      }
      
      // Check if device is now compromised
      const requiredAttempts = selectedDevice.requiredAttempts * gameState.hackingEfficiency;
      
      if (selectedDevice.currentProgress >= requiredAttempts) {
        // Mark as compromised
        selectedDevice.isCompromised = true;
        
        // Ensure progress is exactly at required attempts for clean UI display
        selectedDevice.currentProgress = requiredAttempts;
        
        // Reset hacking state
        gameState.hacking.isActive = false;
        
        createNotification("Target Compromised", `${selectedDevice.name} has been added to your botnet!`, "machine-compromised");
        
        // Find and select the next available target
        gameState.selectedTargetId = findNextAvailableTarget();
        
        // Update displays
        updateHackConsole();
        updateBotnetControl();
        updatePerformanceWindow();
        
        // Force refresh the botnet panel by ensuring it's updated
        triggerBotnetRefresh();
      } else {
        // Just update the progress bar if hack console is open
        if (uiState.windows.hackConsole.isOpen) {
          updateHackProgress();
        }
      }
    }
  } else {
    // If no target is selected, add to password attempts pool
    gameState.passwordAttempts += gameState.passwordAttemptsPerSecond * deltaTime;
    // No target means no active hacking
    gameState.hacking.isActive = false;
  }
  
  // Add cryptocurrency
  const ccGained = gameState.cryptocurrencyPerSecond * deltaTime;
  if (ccGained > 0) {
    gameState.cryptocurrency += ccGained;
    
    // Update wallet window if open
    if (uiState.windows.cryptoWallet.isOpen) {
      updateWalletWindow();
    }
    
    // If we've gained cryptocurrency, refresh the browser if it's open
    if (uiState.windows.upgradeStore.isOpen) {
      const addressBar = document.getElementById("address-bar");
      // Only refresh every 5 seconds to avoid disrupting button clicks
      if (addressBar && (!gameState.lastBrowserRefresh || (now - gameState.lastBrowserRefresh) > 5000)) {
        const currentPage = addressBar.textContent.split('/').pop();
        navigateBrowser(currentPage);
        gameState.lastBrowserRefresh = now; // Track when we last refreshed
      }
    }
  }
  
  // Update personal miner
  if (gameState.miner.isRunning) {
    // Update mining status periodically
    if (now - gameState.miner.lastUpdateTime > 1000) { // Every second
      gameState.miner.lastUpdateTime = now;
      updateMiningStatus();
    }
  }
  
  // Update windows that need constant updating
  if (uiState.windows.hackConsole.isOpen) {
    const currentPaElement = document.getElementById("current-pa");
    if (currentPaElement) {
      currentPaElement.textContent = Math.floor(gameState.passwordAttempts);
    }
  }
  
  if (uiState.windows.systemPerformance.isOpen) {
    updatePerformanceWindow();
  }
  
  // If botnet window is open, periodically refresh it to ensure miners update
  if (uiState.windows.botnetControl.isOpen) {
    if (now % 2000 < 20) { // Every ~2 seconds (but only for a small window to avoid constant refreshes)
      updateBotnetControl();
    }
  }
  
  // Global refresh for all windows every second
  if (now % 1000 < 20) { // Every ~1 second
    updateAllWindows();
  }

  requestAnimationFrame(gameLoop);
};

/**
 * Initializes the game by setting up event listeners and initial state
 */
const initGame = () => {
  // Initialize game from config
  initializeFromConfig();
  
  // Set up taskbar button events
  document.getElementById("open-miner").addEventListener("click", () => toggleWindow("miner"));
  document.getElementById("open-hack-console").addEventListener("click", () => toggleWindow("hackConsole"));
  document.getElementById("open-botnet").addEventListener("click", () => toggleWindow("botnetControl"));
  document.getElementById("open-wallet").addEventListener("click", () => toggleWindow("cryptoWallet"));
  document.getElementById("open-upgrades").addEventListener("click", () => toggleWindow("upgradeStore"));
  document.getElementById("open-performance").addEventListener("click", () => toggleWindow("systemPerformance"));
  document.getElementById("open-settings").addEventListener("click", () => toggleWindow("settings"));
  
  // Add initial transaction
  addTransaction("Initial wallet balance", CONFIG.gameplay.initialCryptocurrency);
  
  // Open miner by default
  openWindow("miner");
  
  // Show welcome notification
  createNotification("Welcome to CodeBreak", "Start by running the crypto miner (type 'start') to earn cryptocurrency for buying your first target device.", "upgrade-purchased");
  
  // Setup hack button click event
  document.addEventListener("click", (e) => {
    if (e.target.id === "hack-button") {
      clickHack();
    }
  });
  
  // Setup prestige button click event
  document.addEventListener("click", (e) => {
    if (e.target.id === "prestige-button" && !e.target.disabled) {
      prestigeReset();
    }
  });
  
  // Start game loop
  requestAnimationFrame(gameLoop);
  
  console.log("Game initialized. First need to mine crypto to purchase devices.");
};

// Start the game when page is loaded
window.addEventListener("DOMContentLoaded", initGame);
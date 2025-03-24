/**
 * main.js
 * Main entry point for the game, contains initialization and game loop
 */

// Add interaction protection flag to prevent UI refreshes from interfering with button clicks
let interactionInProgress = false;
let lastFullRefresh = 0;

/**
 * Main game loop that updates game state and UI
 */
const gameLoop = () => {
  const now = Date.now();
  const deltaTime = (now - gameState.lastTimestamp) / 1000; // in seconds
  gameState.lastTimestamp = now;
  
  // Skip UI updates if user is interacting with UI elements
  const shouldUpdateUI = !interactionInProgress;
  
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
          if (uiState.windows.hackConsole.isOpen && shouldUpdateUI) {
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
      const hackingEfficiency = calculateHackingEfficiency();
      const requiredAttempts = selectedDevice.requiredAttempts * hackingEfficiency;
      
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
        
        // Update displays if we're not in the middle of an interaction
        if (shouldUpdateUI) {
          updateHackConsole();
          updateBotnetControl();
          updatePerformanceWindow();
          
          // Force refresh the botnet panel by ensuring it's updated
          triggerBotnetRefresh();
        }
      } else {
        // Just update the progress bar if hack console is open
        if (uiState.windows.hackConsole.isOpen && shouldUpdateUI) {
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
    
    // Update wallet window if open and not interacting
    if (uiState.windows.cryptoWallet.isOpen && shouldUpdateUI) {
      updateWalletWindow();
    }
    
    // If we've gained cryptocurrency, refresh the browser if it's open
    if (uiState.windows.upgradeStore.isOpen && shouldUpdateUI) {
      const addressBar = document.getElementById("address-bar");
      // Reduce browser refresh frequency to prevent interrupting user interactions
      if (addressBar && now % 5000 < 20) { // Only refresh every ~5 seconds
        const currentPage = addressBar.textContent.split('/').pop();
        navigateBrowser(currentPage);
      }
    }
  }
  
  // Update personal miner
  if (gameState.miner.isRunning && shouldUpdateUI) {
    // Update mining status periodically
    if (now - gameState.miner.lastUpdateTime > 1000) { // Every second
      gameState.miner.lastUpdateTime = now;
      updateMiningStatus();
    }
  }
  
  // Update windows that need constant updating (if no interaction is happening)
  if (shouldUpdateUI) {
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
      if (now % 3000 < 20) { // Reduce to every ~3 seconds
        updateBotnetControl();
      }
    }
    
    // Global refresh for all windows - less frequent now
    if (now - lastFullRefresh > 2000) { // Every 2 seconds instead of 1
      updateAllWindows();
      lastFullRefresh = now;
    }
  }
  
  requestAnimationFrame(gameLoop);
};

/**
 * Initializes the game by setting up event listeners and initial state
 */
const initGame = () => {
  // Initialize game from config
  initializeFromConfig();
  
  // Check if we've just performed a reset
  const gameWasReset = sessionStorage.getItem("game_reset_performed") === "true";
  if (gameWasReset) {
    // Clear the flag
    sessionStorage.removeItem("game_reset_performed");
    
    // Add initial transaction
    addTransaction("Initial wallet balance", CONFIG.gameplay.initialCryptocurrency);
    
    // Open miner by default in a fresh game
    openWindow("miner");
    
    // Show reset success notification
    createNotification("Game Reset", "Your game has been reset successfully.", "upgrade-purchased");
    
    console.log("Game was reset. Starting fresh.");
  } else {
    // Try to load saved game from localStorage
    const loadedFromStorage = loadGameFromLocalStorage();
    
    // If we didn't load from storage, set up fresh game
    if (!loadedFromStorage) {
      // Add initial transaction
      addTransaction("Initial wallet balance", CONFIG.gameplay.initialCryptocurrency);
      
      // Open miner by default in a fresh game
      openWindow("miner");
      
      // Show welcome notification
      createNotification("Welcome to CodeBreak", "Start by running the crypto miner (type 'start') to earn cryptocurrency for buying your first target device.", "upgrade-purchased");
    } else {
      // Show welcome back notification
      createNotification("Welcome Back", "Your game has been loaded from your last session.", "upgrade-purchased");
    }
  }
  
  // Set up desktop event handlers using event delegation
  setupEventDelegation();
  
  // Set up taskbar button events
  document.getElementById("open-miner").addEventListener("click", () => toggleWindow("miner"));
  document.getElementById("open-hack-console").addEventListener("click", () => toggleWindow("hackConsole"));
  document.getElementById("open-botnet").addEventListener("click", () => toggleWindow("botnetControl"));
  document.getElementById("open-wallet").addEventListener("click", () => toggleWindow("cryptoWallet"));
  document.getElementById("open-upgrades").addEventListener("click", () => toggleWindow("upgradeStore"));
  document.getElementById("open-performance").addEventListener("click", () => toggleWindow("systemPerformance"));
  document.getElementById("open-settings").addEventListener("click", () => toggleWindow("settings"));
  
  // Set initial load complete flag
  initialLoadComplete = true;
  
  // Start auto-save
  startAutoSave();
  
  // Set up beforeunload event to save automatically when page is closed/refreshed
  window.addEventListener("beforeunload", () => {
    // Skip saving if we're resetting the game
    if (sessionStorage.getItem("game_reset_performed") !== "true") {
      saveGameToLocalStorage(false); // Don't show notification on page leave
    }
  });
  
  // Start game loop
  requestAnimationFrame(gameLoop);
  
  console.log("Game initialized. " + (gameWasReset ? "Fresh game after reset." : loadedFromStorage ? "Loaded from save." : "Fresh game started."));
};

/**
 * Sets up event delegation to handle clicks consistently without being interrupted by UI updates
 */
const setupEventDelegation = () => {
  // Add mouse event listeners to detect when user is interacting with buttons
  document.addEventListener("mousedown", (e) => {
    // Check if the target or any parents are clickable elements
    if (isClickableElement(e.target)) {
      interactionInProgress = true;
    }
  });
  
  document.addEventListener("mouseup", () => {
    // Short delay before allowing UI updates again
    setTimeout(() => {
      interactionInProgress = false;
    }, 100);
  });
  
  // Click handler for the entire document using event delegation
  document.addEventListener("click", (e) => {
    // Hack button
    if (e.target.id === "hack-button") {
      clickHack();
    } 
    // Prestige button
    else if (e.target.id === "prestige-button" && !e.target.disabled) {
      prestigeReset();
    }
    // Browser back button
    else if (e.target.classList.contains("browser-back") || e.target.parentElement?.classList.contains("browser-back")) {
      navigateBrowser("home");
    }
    // Site links
    else if (e.target.closest(".site-link")) {
      const link = e.target.closest(".site-link");
      const page = link.getAttribute("data-page");
      if (page) {
        navigateBrowser(page);
      }
    }
    // Back to home button
    else if (e.target.id === "back-to-home") {
      navigateBrowser("home");
    }
    // Upgrade purchase buttons
    else if (e.target.classList.contains("purchase-button") && e.target.hasAttribute("data-upgrade-id")) {
      const upgradeId = parseInt(e.target.getAttribute("data-upgrade-id"));
      buyUpgrade(upgradeId);
      // Refresh the page to show the updated state
      navigateBrowser("marketplace");
    }
    // Device purchase buttons
    else if (e.target.classList.contains("purchase-button") && e.target.hasAttribute("data-device-id")) {
      const deviceId = parseInt(e.target.getAttribute("data-device-id"));
      purchaseDevice(deviceId);
      // Refresh the page to show the updated state
      navigateBrowser("forum");
    }
    // Install miner buttons
    else if (e.target.classList.contains("install-miner")) {
      const deviceId = parseInt(e.target.getAttribute("data-device-id"));
      installMiner(deviceId);
    }
  });
};

/**
 * Checks if an element or its parents are clickable UI elements
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} - Whether the element is clickable
 */
const isClickableElement = (element) => {
  // Loop through the element and its parents
  let current = element;
  while (current) {
    // Check if this element is a button, has a click handler, or is otherwise interactive
    if (
      current.tagName === "BUTTON" ||
      current.classList.contains("hack-button") ||
      current.classList.contains("purchase-button") ||
      current.classList.contains("target-item") ||
      current.classList.contains("site-link") ||
      current.classList.contains("window-control") ||
      current.classList.contains("browser-button") ||
      current.classList.contains("install-miner") ||
      current.id === "hack-button" ||
      current.id === "prestige-button" ||
      current.id === "back-to-home" ||
      current.getAttribute("data-upgrade-id") ||
      current.getAttribute("data-device-id") ||
      current.getAttribute("data-window") ||
      current.getAttribute("data-page")
    ) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
};

// Start the game when page is loaded
window.addEventListener("DOMContentLoaded", initGame);
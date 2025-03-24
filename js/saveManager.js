/**
 * saveManager.js
 * Handles saving and loading game state
 */

// Auto-save interval in milliseconds (default: 60 seconds)
const AUTO_SAVE_INTERVAL = 60000;

// LocalStorage key for the game save
const SAVE_KEY = "botnet_domination_save";

// Flag to prevent auto-saving during initial load
let initialLoadComplete = false;

// Timer ID for auto-save
let autoSaveTimerId = null;

/**
 * Generates a save string from the current game state
 * @returns {string} - Encoded save string
 */
const generateSaveString = () => {
  // Get current browser page if browser is open
  let currentBrowserPage = "home";
  const addressBar = document.getElementById("address-bar");
  if (addressBar) {
    currentBrowserPage = addressBar.textContent.split('/').pop();
  }
  
  // Capture window sizes before saving
  Object.keys(uiState.windows).forEach(windowType => {
    if (uiState.windows[windowType].isOpen) {
      const windowElement = document.getElementById(`${windowType.replace(/([A-Z])/g, "-$1").toLowerCase()}-window`);
      if (windowElement) {
        // Store the current width and height
        if (!uiState.windows[windowType].size) {
          uiState.windows[windowType].size = {};
        }
        uiState.windows[windowType].size.width = windowElement.offsetWidth;
        uiState.windows[windowType].size.height = windowElement.offsetHeight;
      }
    }
  });
  
  // Create a copy of the game state to sanitize
  const saveObject = {
    devices: allDevices.map(device => ({
      id: device.id,
      isCompromised: device.isCompromised,
      currentProgress: device.currentProgress,
      hasMiner: device.hasMiner,
      isPurchased: device.isPurchased
    })),
    upgrades: upgradeDefinitions.map(upgrade => ({
      id: upgrade.id,
      purchased: upgrade.purchased
    })),
    stats: {
      passwordAttempts: gameState.passwordAttempts,
      cryptocurrency: gameState.cryptocurrency,
      userCPU: gameState.userCPU,
      userGPU: gameState.userGPU,
      masterKeyTokens: gameState.masterKeyTokens,
      totalPAThisRun: gameState.totalPAThisRun,
      selectedTargetId: gameState.selectedTargetId
    },
    miner: {
      isRunning: gameState.miner.isRunning,
      startTime: gameState.miner.startTime,
      totalMined: gameState.miner.totalMined,
      baseHashRate: gameState.miner.baseHashRate,
      hashRate: gameState.miner.hashRate,
      lastUpdateTime: gameState.miner.lastUpdateTime
    },
    // Save the transaction log
    transactions: gameState.transactions,
    // Save window states
    uiState: {
      windows: JSON.parse(JSON.stringify(uiState.windows)),
      activeWindow: uiState.activeWindow,
      highestZIndex: uiState.highestZIndex
    },
    // Save browser state
    browserState: {
      currentPage: currentBrowserPage
    },
    saveVersion: 1, // Version number for future compatibility
    saveTimestamp: Date.now() // Add timestamp for auto-save info
  };
  
  // Convert to JSON string
  const jsonString = JSON.stringify(saveObject);
  
  // Base64 encode (with some light obfuscation)
  return btoa(jsonString);
};

/**
 * Loads game state from a save string
 * @param {string} saveString - Encoded save string
 * @returns {boolean} - Whether the load was successful
 */
const loadSaveString = (saveString) => {
  try {
    // Decode the save string
    const jsonString = atob(saveString);
    
    // Parse the JSON
    const saveObject = JSON.parse(jsonString);
    
    // Verify save version for compatibility
    if (!saveObject.saveVersion) {
      createNotification("Error", "Invalid save data format", "error-notification");
      return false;
    }
    
    // Load devices
    if (saveObject.devices && Array.isArray(saveObject.devices)) {
      saveObject.devices.forEach(savedDevice => {
        const device = allDevices.find(d => d.id === savedDevice.id);
        if (device) {
          device.isCompromised = savedDevice.isCompromised;
          device.currentProgress = savedDevice.currentProgress;
          device.hasMiner = savedDevice.hasMiner;
          device.isPurchased = savedDevice.isPurchased;
        }
      });
    }
    
    // Load upgrades
    if (saveObject.upgrades && Array.isArray(saveObject.upgrades)) {
      saveObject.upgrades.forEach(savedUpgrade => {
        const upgrade = upgradeDefinitions.find(u => u.id === savedUpgrade.id);
        if (upgrade) {
          upgrade.purchased = savedUpgrade.purchased;
        }
      });
    }
    
    // Load stats
    if (saveObject.stats) {
      gameState.passwordAttempts = saveObject.stats.passwordAttempts || 0;
      gameState.cryptocurrency = saveObject.stats.cryptocurrency || 0;
      gameState.userCPU = saveObject.stats.userCPU || 0;
      gameState.userGPU = saveObject.stats.userGPU || 0;
      gameState.masterKeyTokens = saveObject.stats.masterKeyTokens || 0;
      gameState.totalPAThisRun = saveObject.stats.totalPAThisRun || 0;
      gameState.selectedTargetId = saveObject.stats.selectedTargetId;
    }
    
    // Load complete miner state but pause it initially
    const minerWasRunning = saveObject.miner && saveObject.miner.isRunning;
    if (saveObject.miner) {
      // Temporarily set isRunning to false so we can properly restart it later
      gameState.miner.isRunning = false;
      gameState.miner.totalMined = saveObject.miner.totalMined || 0;
      gameState.miner.baseHashRate = saveObject.miner.baseHashRate || 3.0;
      gameState.miner.hashRate = saveObject.miner.hashRate || 3.0;
      gameState.miner.startTime = Date.now(); // Reset to now
      gameState.miner.lastUpdateTime = Date.now(); // Reset to now
    }
    
    // Load transaction history
    if (saveObject.transactions && Array.isArray(saveObject.transactions)) {
      gameState.transactions = saveObject.transactions;
    }
    
    // Load window states
    if (saveObject.uiState && saveObject.uiState.windows) {
      // First close all currently open windows
      Object.keys(uiState.windows).forEach(windowType => {
        if (uiState.windows[windowType].isOpen) {
          closeWindow(windowType);
        }
      });
      
      // Update uiState with saved window states, but mark all as closed initially
      const savedWindowStates = JSON.parse(JSON.stringify(saveObject.uiState.windows));
      Object.keys(savedWindowStates).forEach(windowType => {
        savedWindowStates[windowType].isOpen = false;
        savedWindowStates[windowType].wasMinimized = false;
      });
      
      uiState.windows = savedWindowStates;
      uiState.activeWindow = null; // Will set this later
      uiState.highestZIndex = saveObject.uiState.highestZIndex;
      
      // Get lists of windows to open (normal and minimized)
      const normalWindows = Object.keys(saveObject.uiState.windows).filter(windowType => 
        saveObject.uiState.windows[windowType].isOpen && !saveObject.uiState.windows[windowType].wasMinimized
      );
      
      const minimizedWindows = Object.keys(saveObject.uiState.windows).filter(windowType => 
        saveObject.uiState.windows[windowType].isOpen && saveObject.uiState.windows[windowType].wasMinimized
      );
      
      // Open normal windows with a delay between each
      let delay = 0;
      
      // First, open all non-minimized windows
      normalWindows.forEach(windowType => {
        setTimeout(() => {
          // Mark as not open so openWindow() will actually create it
          uiState.windows[windowType].isOpen = false;
          uiState.windows[windowType].wasMinimized = false;
          
          // Open the window
          openWindow(windowType);
          
          // Set window position and size after it's opened
          const windowElement = document.getElementById(`${windowType.replace(/([A-Z])/g, "-$1").toLowerCase()}-window`);
          if (windowElement) {
            // Set position
            windowElement.style.left = `${saveObject.uiState.windows[windowType].position.x}px`;
            windowElement.style.top = `${saveObject.uiState.windows[windowType].position.y}px`;
            windowElement.style.zIndex = saveObject.uiState.windows[windowType].zIndex;
            
            // Set size if saved
            if (saveObject.uiState.windows[windowType].size) {
              windowElement.style.width = `${saveObject.uiState.windows[windowType].size.width}px`;
              windowElement.style.height = `${saveObject.uiState.windows[windowType].size.height}px`;
            }
          }
        }, delay);
        delay += 100; // Slightly longer delay to ensure proper initialization
      });
      
      // Then, handle minimized windows (open and then minimize them)
      minimizedWindows.forEach(windowType => {
        setTimeout(() => {
          // Mark as not open so openWindow() will actually create it
          uiState.windows[windowType].isOpen = false;
          uiState.windows[windowType].wasMinimized = false;
          
          // Open the window
          openWindow(windowType);
          
          // Set size if saved (even for minimized windows)
          const windowElement = document.getElementById(`${windowType.replace(/([A-Z])/g, "-$1").toLowerCase()}-window`);
          if (windowElement && saveObject.uiState.windows[windowType].size) {
            windowElement.style.width = `${saveObject.uiState.windows[windowType].size.width}px`;
            windowElement.style.height = `${saveObject.uiState.windows[windowType].size.height}px`;
          }
          
          // Then minimize it right away
          setTimeout(() => {
            minimizeWindow(windowType);
          }, 50);
        }, delay);
        delay += 100;
      });
      
      // Reset active window after all windows are opened
      if (saveObject.uiState.activeWindow && normalWindows.includes(saveObject.uiState.activeWindow)) {
        setTimeout(() => {
          setActiveWindow(saveObject.uiState.activeWindow);
        }, delay + 200);
      }
      
      // Properly restart the miner if it was running
      if (minerWasRunning) {
        setTimeout(() => {
          // Make sure to fully restart the mining process
          gameState.miner.isRunning = true;
          gameState.miner.startTime = Date.now();
          gameState.miner.lastUpdateTime = Date.now();
          
          // Update hash rate based on current CPU/GPU
          updateMinerHashRate();
          
          // Update terminal and UI
          const terminalOutput = document.getElementById("terminal-output");
          if (terminalOutput) {
            const statusLine = document.createElement("div");
            statusLine.className = "terminal-line";
            statusLine.innerHTML = `<span class="terminal-status">Miner restarted from saved state.</span>`;
            terminalOutput.appendChild(statusLine);
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
          }
          
          // Show mining status
          const miningStatus = document.getElementById("mining-status");
          if (miningStatus) {
            miningStatus.style.display = "flex";
          }
          
          // Update stats display
          updateMiningStatus();
          
          // Start the mining simulation with a fresh instance
          simulateMiningOutput();
        }, delay + 300); // Do this after all windows are properly set up
      }
    }
    
    // Reset temporary state
    gameState.hacking.isActive = false;
    gameState.hacking.progressCounter = 0;
    gameState.hacking.attemptsMade = 0;
    
    // Recalculate resource rates
    calculateResourceRates();
    
    // Handle browser state if browser window is open
    if (saveObject.browserState && saveObject.browserState.currentPage) {
      // We need to set a small timeout to ensure the browser window is fully initialized
      setTimeout(() => {
        if (uiState.windows.upgradeStore.isOpen) {
          navigateBrowser(saveObject.browserState.currentPage);
        }
      }, 500); // Increased timeout to ensure browser is ready
    }
    
    // Update all UI elements
    setTimeout(() => {
      updateAllWindows();
    }, 600);
    
    createNotification("Game Loaded", "Your saved game has been loaded successfully", "upgrade-purchased");
    return true;
  } catch (error) {
    console.error("Error loading save:", error);
    createNotification("Error", "Failed to load save data", "error-notification");
    return false;
  }
};

/**
 * Saves the game to localStorage
 * @param {boolean} showNotification - Whether to show a notification
 * @returns {boolean} - Whether the save was successful
 */
const saveGameToLocalStorage = (showNotification = true) => {
  try {
    // Generate save string
    const saveString = generateSaveString();
    
    // Save to localStorage
    localStorage.setItem(SAVE_KEY, saveString);
    
    // Optional notification
    if (showNotification) {
      createNotification("Game Saved", "Your game has been automatically saved", "upgrade-purchased");
    }
    
    return true;
  } catch (error) {
    console.error("Error saving game to localStorage:", error);
    
    // Only show error notification if requested
    if (showNotification) {
      createNotification("Error", "Failed to auto-save game", "error-notification");
    }
    
    return false;
  }
};

/**
 * Loads the game from localStorage
 * @returns {boolean} - Whether the load was successful
 */
const loadGameFromLocalStorage = () => {
  try {
    // Get save string from localStorage
    const saveString = localStorage.getItem(SAVE_KEY);
    
    // If no save exists, return false
    if (!saveString) {
      return false;
    }
    
    // Load save string
    return loadSaveString(saveString);
  } catch (error) {
    console.error("Error loading game from localStorage:", error);
    return false;
  }
};

/**
 * Starts auto-saving the game
 */
const startAutoSave = () => {
  // Clear any existing auto-save timer
  stopAutoSave();
  
  // Set up new auto-save timer
  autoSaveTimerId = setInterval(() => {
    // Only auto-save if initial load is complete
    if (initialLoadComplete) {
      saveGameToLocalStorage(false); // Don't show notifications for auto-saves
    }
  }, AUTO_SAVE_INTERVAL);
  
  console.log("Auto-save started with interval:", AUTO_SAVE_INTERVAL, "ms");
};

/**
 * Stops auto-saving the game
 */
const stopAutoSave = () => {
  if (autoSaveTimerId !== null) {
    clearInterval(autoSaveTimerId);
    autoSaveTimerId = null;
    console.log("Auto-save stopped");
  }
};

/**
 * Resets the game to initial state
 */
const resetGame = () => {
  try {
    // Clear localStorage (make sure it actually happens)
    console.log("Clearing localStorage...");
    localStorage.removeItem(SAVE_KEY);
    
    // Double-check to make sure it's really gone
    if (localStorage.getItem(SAVE_KEY)) {
      console.error("Failed to remove save data! Trying alternate method...");
      localStorage.setItem(SAVE_KEY, ""); // Set to empty string
      localStorage.clear(); // Clear all localStorage as a last resort
    }
    
    // Set a flag in sessionStorage to confirm reset was performed
    // (sessionStorage persists during page reload but clears when tab/browser closes)
    sessionStorage.setItem("game_reset_performed", "true");
    
    console.log("Game reset complete. Reloading page...");
    
    // Force a hard reload (bypassing cache)
    window.location.href = window.location.href + "?reset=" + Date.now();
  } catch (error) {
    console.error("Error during game reset:", error);
    alert("Error resetting game. Please try again or clear your browser cache manually.");
  }
};

/**
 * Formats a timestamp into a readable date/time string
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} - Formatted date/time string
 */
const formatSaveTime = (timestamp) => {
  if (!timestamp) return "Unknown";
  
  const date = new Date(timestamp);
  return date.toLocaleString();
};

/**
 * Updates the last saved time in the settings window
 */
const updateLastSavedTime = () => {
  try {
    const lastSavedElement = document.getElementById("last-saved-time");
    if (!lastSavedElement) return;
    
    // Get the save from localStorage
    const saveString = localStorage.getItem(SAVE_KEY);
    if (!saveString) {
      lastSavedElement.textContent = "Never";
      return;
    }
    
    // Decode and parse
    const jsonString = atob(saveString);
    const saveObject = JSON.parse(jsonString);
    
    // Update the last saved time
    lastSavedElement.textContent = formatSaveTime(saveObject.saveTimestamp);
  } catch (error) {
    console.error("Error updating last saved time:", error);
  }
}; 
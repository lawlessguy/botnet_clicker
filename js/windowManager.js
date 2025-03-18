/**
 * windowManager.js
 * Handles creation, positioning, and management of game windows
 */

/**
 * Creates the base window element
 * @param {string} windowType - Type identifier for the window
 * @param {string} title - Window title 
 * @param {string} content - HTML content for window
 * @param {string} width - CSS width value
 * @param {string} height - CSS height value
 * @returns {HTMLElement} - The created window element
 */
const createWindowBase = (windowType, title, content, width, height) => {
  const windowConfig = uiState.windows[windowType];
  const window = document.createElement("div");
  window.className = "window";
  window.id = `${windowType.replace(/([A-Z])/g, "-$1").toLowerCase()}-window`;
  window.style.left = `${windowConfig.position.x}px`;
  window.style.top = `${windowConfig.position.y}px`;
  window.style.width = width;
  window.style.height = height;
  window.style.zIndex = windowConfig.zIndex;
  
  window.innerHTML = `
    <div class="window-header">
      <div class="window-title">${title}</div>
      <div class="window-controls">
        <div class="window-control minimize" data-window="${windowType}">-</div>
        <div class="window-control close" data-window="${windowType}">×</div>
      </div>
    </div>
    <div class="window-content">
      ${content}
    </div>
  `;
  
  return window;
};

/**
 * Creates the Hack Console window
 * @returns {HTMLElement} - The created window element
 */
const createHackConsoleWindow = () => {
  const content = `
    <h3>Uncompromised Devices</h3>
    <div class="target-list" id="target-list">
      <!-- Target items will be dynamically inserted here -->
    </div>
    
    <div class="error-message" id="hack-error">
      No target selected. Please select a machine before hacking.
    </div>
    
    <div class="progress-container">
      <div id="progress-label">Select a target to start hacking</div>
      <div class="progress-bar">
        <div class="progress-fill" id="hack-progress"></div>
      </div>
    </div>
    
    <button class="hack-button" id="hack-button">ATTEMPT PASSWORD</button>
    
    <div class="password-display" id="password-display">
      <div class="password-label">Last Attempt:</div>
      <div class="password-value" id="current-password">Waiting to start...</div>
    </div>
    
    <div class="stats-container">
      <div class="stat-item">
        <div>Password Attempts:</div>
        <div id="current-pa">0</div>
      </div>
      <div class="stat-item">
        <div>PA per second:</div>
        <div id="pa-per-second">0.0</div>
      </div>
      <div class="stat-item">
        <div>CC per second:</div>
        <div id="cc-per-second">0.0</div>
      </div>
    </div>
  `;
  
  return createWindowBase("hackConsole", "Hack Console", content, "300px", "450px");
};

/**
 * Creates the Botnet Control window
 * @returns {HTMLElement} - The created window element
 */
const createBotnetWindow = () => {
  const content = `
    <h3>Compromised Machines</h3>
    <div class="machine-list" id="machine-list">
      <div class="no-machines-message" id="no-machines-message">
        No machines compromised yet. Start hacking!
      </div>
      <!-- Machine items will be dynamically inserted here -->
    </div>
  `;
  
  return createWindowBase("botnetControl", "Botnet Control Panel", content, "300px", "400px");
};

/**
 * Creates the Crypto Wallet window
 * @returns {HTMLElement} - The created window element
 */
const createWalletWindow = () => {
  const content = `
    <div class="crypto-balance">
      <div>Balance:</div>
      <div class="crypto-amount" id="crypto-balance">0 CC</div>
    </div>
    
    <h3>Transaction Log</h3>
    <div class="transaction-log" id="transaction-log">
      <div class="transaction-item">
        <div>Initial balance</div>
        <div class="transaction-amount">0 CC</div>
      </div>
      <!-- Transaction items will be dynamically inserted here -->
    </div>
  `;
  
  return createWindowBase("cryptoWallet", "Crypto Wallet", content, "300px", "350px");
};

/**
 * Creates the Upgrade Store window (browser)
 * @returns {HTMLElement} - The created window element
 */
const createUpgradeWindow = () => {
  const content = `
    <div class="browser">
      <div class="browser-bar">
        <div class="browser-buttons">
          <div class="browser-button browser-back" id="browser-back"></div>
          <div class="browser-button browser-refresh" id="browser-refresh"></div>
        </div>
        <div class="address-bar" id="address-bar">dark://onion/home</div>
      </div>
      <div class="browser-content" id="browser-content">
        <!-- The browser content will be dynamically loaded -->
      </div>
    </div>
  `;
  
  return createWindowBase("upgradeStore", "TorX Browser", content, "500px", "550px");
};

/**
 * Creates the System Performance window
 * @returns {HTMLElement} - The created window element
 */
const createPerformanceWindow = () => {
  const content = `
    <div class="performance-section">
      <div class="performance-title">Your Machine Stats</div>
      <div class="resource-breakdown">
        <div class="breakdown-item">
          <div>CPU Power:</div>
          <div id="user-cpu">0</div>
        </div>
        <div class="breakdown-item">
          <div>GPU Power:</div>
          <div id="user-gpu">0</div>
        </div>
      </div>
    </div>
    
    <div class="performance-section">
      <div class="performance-title">Botnet Password Attempts/sec</div>
      <div class="resource-breakdown" id="pa-breakdown">
        <div class="breakdown-item">
          <div>From compromised machines:</div>
          <div id="botnet-pa">0.0</div>
        </div>
        <div class="breakdown-item">
          <div>From your machine:</div>
          <div id="user-pa">0.0</div>
        </div>
        <div class="breakdown-item">
          <div>Upgrade multiplier:</div>
          <div id="pa-multiplier">x1.0</div>
        </div>
        <div class="breakdown-item">
          <div>Total:</div>
          <div id="total-pa-rate">0.0</div>
        </div>
      </div>
    </div>
    
    <div class="performance-section">
      <div class="performance-title">Crypto Mining Rate</div>
      <div class="resource-breakdown" id="cc-breakdown">
        <div class="breakdown-item">
          <div>From mining machines:</div>
          <div id="botnet-cc">0.0</div>
        </div>
        <div class="breakdown-item">
          <div>From your machine:</div>
          <div id="user-cc">0.0</div>
        </div>
        <div class="breakdown-item">
          <div>Upgrade multiplier:</div>
          <div id="cc-multiplier">x1.0</div>
        </div>
        <div class="breakdown-item">
          <div>Total:</div>
          <div id="total-cc-rate">0.0</div>
        </div>
      </div>
    </div>
    
    <div class="prestige-section">
      <div class="performance-title">Global Master Key</div>
      <div class="prestige-info">
        <div>Progress toward Master Key:</div>
        <div class="prestige-progress">
          <div class="progress-bar">
            <div class="progress-fill" id="prestige-progress"></div>
          </div>
          <div id="prestige-value">0 / 1,000,000 PA</div>
        </div>
        <div>Current Master Key Tokens: <span id="master-key-tokens">0</span></div>
        <div>Current multiplier: <span id="master-key-multiplier">x1.0</span></div>
      </div>
      <button class="prestige-button" id="prestige-button" disabled>Activate Global Master Key</button>
    </div>
  `;
  
  return createWindowBase("systemPerformance", "System Performance", content, "350px", "450px");
};

/**
 * Creates the Personal Crypto Miner window
 * @returns {HTMLElement} - The created window element
 */
const createMinerWindow = () => {
  const content = `
    <div class="terminal">
      <div class="terminal-output" id="terminal-output">
        <div class="terminal-line">Welcome to CryptoSurge Miner v1.3.7</div>
        <div class="terminal-line">Type 'help' for available commands</div>
        <div class="terminal-line">------------------------------------</div>
        <div class="terminal-line terminal-status">GETTING STARTED:</div>
        <div class="terminal-line">1. Type 'start' to begin mining cryptocurrency</div>
        <div class="terminal-line">2. Earn at least 25 CC to buy your first target</div>
        <div class="terminal-line">3. Open the Upgrade Store to access the Dark Web</div>
        <div class="terminal-line">4. Navigate to the Dark Forum to purchase target access</div>
        <div class="terminal-line">------------------------------------</div>
      </div>
      
      <div class="terminal-input-line">
        <span class="terminal-prompt">user@localhost:~$</span>
        <input type="text" class="terminal-input" id="terminal-input" spellcheck="false" autocomplete="off">
      </div>
      
      <div class="mining-status" id="mining-status" style="display: none;">
        <div class="mining-stat">
          <div class="mining-label">STATUS</div>
          <div class="mining-value" id="mining-status-value">IDLE</div>
        </div>
        <div class="mining-stat">
          <div class="mining-label">HASHRATE</div>
          <div class="mining-value" id="mining-hashrate">0 H/s</div>
        </div>
        <div class="mining-stat">
          <div class="mining-label">FOUND</div>
          <div class="mining-value" id="mining-found">0 CC</div>
        </div>
        <div class="mining-stat">
          <div class="mining-label">UPTIME</div>
          <div class="mining-value" id="mining-uptime">00:00:00</div>
        </div>
      </div>
    </div>
  `;
  
  return createWindowBase("miner", "Personal Crypto Miner", content, "550px", "350px");
};

/**
 * Creates the Settings window
 * @returns {HTMLElement} - The Settings window element
 */
const createSettingsWindow = () => {
  const content = `
    <div class="settings-container">
      <h3>Game Settings</h3>
      
      <div class="settings-section">
        <h4>Save Game</h4>
        <p>Copy this string to save your game progress:</p>
        <textarea id="save-code" class="save-code" rows="3" readonly></textarea>
        <div class="settings-buttons">
          <button id="copy-save" class="settings-button">Copy Code</button>
        </div>
      </div>
      
      <div class="settings-section">
        <h4>Load Game</h4>
        <p>Paste a previously saved game code below:</p>
        <textarea id="import-code" class="save-code" rows="3" placeholder="Paste your save code here..."></textarea>
        <div class="settings-buttons">
          <button id="import-save" class="settings-button">Import Game</button>
        </div>
      </div>
      
      <div class="settings-section">
        <h4>Prestige</h4>
        <p>Reset your progress for permanent bonuses</p>
        <div class="prestige-info">
          <div>Current Progress: <span id="settings-prestige-value">0 / 1,000,000 PA</span></div>
          <div>Master Key Tokens: <span id="settings-master-key-tokens">0</span></div>
          <div>Current Multiplier: <span id="settings-master-key-multiplier">x1.0</span></div>
        </div>
        <div class="progress-bar prestige-bar">
          <div class="progress-fill" id="settings-prestige-progress"></div>
        </div>
        <button id="settings-prestige-button" class="prestige-button" disabled>Activate Global Master Key</button>
      </div>
    </div>
  `;
  
  return createWindowBase("settings", "Settings", content, "400px", "500px");
};

/**
 * Opens a window based on window type
 * @param {string} windowType - Type of window to open
 */
const openWindow = (windowType) => {
  const windowConfig = uiState.windows[windowType];
  
  // If window is already open, just focus it
  if (windowConfig.isOpen) {
    setActiveWindow(windowType);
    return;
  }
  
  // Restore window if it was minimized
  if (windowConfig.wasMinimized) {
    const windowElement = document.getElementById(`${windowType.replace(/([A-Z])/g, "-$1").toLowerCase()}-window`);
    if (windowElement) {
      windowElement.style.display = "flex";
      windowConfig.wasMinimized = false;
      windowConfig.isOpen = true;
      setActiveWindow(windowType);
      updateTaskbarButtons();
      return;
    }
  }
  
  // Create and add window element
  let windowElement;
  
  switch (windowType) {
    case "hackConsole":
      windowElement = createHackConsoleWindow();
      break;
    case "botnetControl":
      windowElement = createBotnetWindow();
      break;
    case "cryptoWallet":
      windowElement = createWalletWindow();
      break;
    case "upgradeStore":
      windowElement = createUpgradeWindow();
      break;
    case "systemPerformance":
      windowElement = createPerformanceWindow();
      break;
    case "miner":
      windowElement = createMinerWindow();
      break;
    case "settings":
      windowElement = createSettingsWindow();
      break;
  }
  
  if (windowElement) {
    document.getElementById("desktop").appendChild(windowElement);
    makeWindowDraggable(windowElement, windowType);
    
    // Mark window as open
    windowConfig.isOpen = true;
    setActiveWindow(windowType);
    
    // Initialize window content
    switch (windowType) {
      case "hackConsole":
        updateHackConsole();
        break;
      case "botnetControl":
        updateBotnetControl();
        break;
      case "cryptoWallet":
        updateWalletWindow();
        break;
      case "upgradeStore":
        // Initialize browser navigation
        navigateBrowser("home");
        break;
      case "systemPerformance":
        updatePerformanceWindow();
        break;
      case "miner":
        // Initialize miner content
        updateMinerContent();
        break;
      case "settings":
        // Initialize settings content
        updateSettingsWindow();
        break;
    }
    
    updateTaskbarButtons();
  }
};

/**
 * Closes a window by type
 * @param {string} windowType - Type identifier for the window
 */
const closeWindow = (windowType) => {
  const windowElement = document.getElementById(`${windowType.replace(/([A-Z])/g, "-$1").toLowerCase()}-window`);
  
  if (windowElement) {
    windowElement.remove();
    uiState.windows[windowType].isOpen = false;
    
    if (uiState.activeWindow === windowType) {
      uiState.activeWindow = null;
    }
    
    // Update taskbar buttons
    updateTaskbarButtons();
  }
};

/**
 * Minimizes a window by type
 * @param {string} windowType - Type identifier for the window
 */
const minimizeWindow = (windowType) => {
  const windowElement = document.getElementById(`${windowType.replace(/([A-Z])/g, "-$1").toLowerCase()}-window`);
  
  if (windowElement) {
    // Store current state before minimizing
    uiState.windows[windowType].wasMinimized = true;
    windowElement.style.display = "none";
    
    if (uiState.activeWindow === windowType) {
      uiState.activeWindow = null;
    }
    
    // Update taskbar buttons
    updateTaskbarButtons();
  }
};

/**
 * Sets a window as active (brings to front)
 * @param {string} windowType - Type identifier for the window
 */
const setActiveWindow = (windowType) => {
  // First, remove active class from all windows
  document.querySelectorAll(".window").forEach(win => {
    win.classList.remove("active");
  });
  
  const windowElement = document.getElementById(`${windowType.replace(/([A-Z])/g, "-$1").toLowerCase()}-window`);
  
  if (windowElement) {
    // Ensure window is visible if it was minimized
    windowElement.style.display = "block";
    uiState.windows[windowType].wasMinimized = false;
    
    // Set active class and update z-index
    windowElement.classList.add("active");
    uiState.highestZIndex++;
    windowElement.style.zIndex = uiState.highestZIndex;
    uiState.windows[windowType].zIndex = uiState.highestZIndex;
    
    uiState.activeWindow = windowType;
    
    // Update taskbar buttons
    updateTaskbarButtons();
  }
};

/**
 * Makes a window draggable and adds window controls
 * @param {HTMLElement} windowElement - The window element
 * @param {string} windowType - Type identifier for the window
 */
const makeWindowDraggable = (windowElement, windowType) => {
  const header = windowElement.querySelector(".window-header");
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  
  header.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("window-control")) {
      return; // Don't start dragging if user clicked on a control button
    }
    
    isDragging = true;
    offsetX = e.clientX - windowElement.getBoundingClientRect().left;
    offsetY = e.clientY - windowElement.getBoundingClientRect().top;
    
    setActiveWindow(windowType);
  });
  
  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    
    // Keep window within screen bounds
    const maxX = window.innerWidth - windowElement.offsetWidth;
    const maxY = window.innerHeight - windowElement.offsetHeight;
    
    const boundedX = Math.max(0, Math.min(x, maxX));
    const boundedY = Math.max(0, Math.min(y, maxY));
    
    windowElement.style.left = `${boundedX}px`;
    windowElement.style.top = `${boundedY}px`;
    
    // Update position in UI state
    uiState.windows[windowType].position.x = boundedX;
    uiState.windows[windowType].position.y = boundedY;
  });
  
  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
  
  // Window click handler to bring to front
  windowElement.addEventListener("mousedown", () => {
    setActiveWindow(windowType);
  });
  
  // Window control buttons
  windowElement.querySelectorAll(".window-control").forEach(control => {
    control.addEventListener("click", (e) => {
      const targetWindow = e.target.getAttribute("data-window");
      
      if (control.classList.contains("close")) {
        closeWindow(targetWindow);
      } else if (control.classList.contains("minimize")) {
        minimizeWindow(targetWindow);
      }
    });
  });
  
  // Make window resizable
  const resizeHandle = windowElement.querySelector(".resize-handle");
  if (resizeHandle) {
    let isResizing = false;
    let originalWidth = 0;
    let originalHeight = 0;
    let originalX = 0;
    let originalY = 0;
    
    resizeHandle.addEventListener("mousedown", (e) => {
      isResizing = true;
      originalWidth = windowElement.offsetWidth;
      originalHeight = windowElement.offsetHeight;
      originalX = e.clientX;
      originalY = e.clientY;
      e.stopPropagation();
      setActiveWindow(windowType);
    });
    
    document.addEventListener("mousemove", (e) => {
      if (!isResizing) return;
      
      const newWidth = originalWidth + (e.clientX - originalX);
      const newHeight = originalHeight + (e.clientY - originalY);
      
      if (newWidth >= 320) {
        windowElement.style.width = `${newWidth}px`;
      }
      
      if (newHeight >= 200) {
        windowElement.style.height = `${newHeight}px`;
      }
    });
    
    document.addEventListener("mouseup", () => {
      isResizing = false;
    });
  }
};

/**
 * Toggles a window open/closed/minimized
 * @param {string} windowType - Type identifier for the window
 */
const toggleWindow = (windowType) => {
  const windowConfig = uiState.windows[windowType];
  
  if (!windowConfig.isOpen) {
    // If window is not open, open it
    openWindow(windowType);
  } else if (windowConfig.wasMinimized) {
    // If window is minimized, restore it
    const windowElement = document.getElementById(`${windowType.replace(/([A-Z])/g, "-$1").toLowerCase()}-window`);
    if (windowElement) {
      windowElement.style.display = "block";
      windowConfig.wasMinimized = false;
      setActiveWindow(windowType);
      updateTaskbarButtons();
    }
  } else {
    // If window is open and not minimized, minimize it
    minimizeWindow(windowType);
  }
};

/**
 * Updates the taskbar buttons to reflect current window states
 */
const updateTaskbarButtons = () => {
  // Remove active and minimized classes from all taskbar buttons
  document.querySelectorAll('.taskbar-button').forEach(button => {
    button.classList.remove('active');
    button.classList.remove('minimized');
  });
  
  // Add appropriate classes based on window states
  Object.keys(uiState.windows).forEach(windowType => {
    // Map the window type to taskbar button ID
    let buttonId;
    switch(windowType) {
      case 'miner':
        buttonId = 'open-miner';
        break;
      case 'hackConsole':
        buttonId = 'open-hack-console';
        break;
      case 'botnetControl':
        buttonId = 'open-botnet';
        break;
      case 'cryptoWallet':
        buttonId = 'open-wallet';
        break;
      case 'upgradeStore':
        buttonId = 'open-upgrades';
        break;
      case 'systemPerformance':
        buttonId = 'open-performance';
        break;
      case 'settings':
        buttonId = 'open-settings';
        break;
      default:
        return;
    }
    
    const button = document.getElementById(buttonId);
    if (button) {
      if (uiState.windows[windowType].isOpen) {
        if (uiState.windows[windowType].wasMinimized) {
          button.classList.add('minimized');
        } else {
          button.classList.add('active');
        }
      }
    }
  });
};
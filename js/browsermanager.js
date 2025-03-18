/**
 * browserManager.js
 * Handles the in-game browser for device purchases and upgrades
 */

/**
 * Navigates the in-game browser to a specific page
 * @param {string} page - The page to navigate to (home, marketplace, forum)
 */
const navigateBrowser = (page) => {
  const browserContent = document.getElementById("browser-content");
  const addressBar = document.getElementById("address-bar");
  
  if (!browserContent || !addressBar) return;
  
  // Update address bar
  let address = "dark://onion/";
  
  switch (page) {
    case "home":
      address += "home";
      browserContent.innerHTML = `
        <div class="dark-web-home">
          <h2>Dark Web Directory</h2>
          <p style="color: #aaa; margin-bottom: 20px;">Welcome to the hidden network. Browse at your own risk.</p>
          
          <div class="site-link" data-page="marketplace">
            <div class="site-title">Black Market</div>
            <div class="site-desc">Purchase upgrades and tools for your hacking operations.</div>
          </div>
          
          <div class="site-link" data-page="forum">
            <div class="site-title">Dark Forum</div>
            <div class="site-desc">Find and purchase access to new target devices.</div>
          </div>
        </div>
      `;
      break;
      
    case "marketplace":
      address += "marketplace";
      // Generate upgrade listings
      let upgradeHTML = `
        <div class="dark-web-home">
          <h2>Black Market</h2>
          <p style="color: #aaa; margin-bottom: 20px;">Purchase upgrades to enhance your hacking capabilities.</p>
      `;
      
      // Filter for unpurchased upgrades
      const availableUpgrades = upgradeDefinitions.filter(u => !u.purchased);
      
      if (availableUpgrades.length === 0) {
        upgradeHTML += `<p style="color: #aaa; text-align: center; padding: 20px;">No upgrades available. You've purchased everything!</p>`;
      } else {
        availableUpgrades.forEach(upgrade => {
          // Calculate if player can afford the upgrade
          const canAfford = gameState.cryptocurrency >= upgrade.costCC;
          
          // Check if requirements are met
          const totalCPU = calculateTotalCPU();
          const totalGPU = calculateTotalGPU();
          
          const cpuRequirementMet = totalCPU >= upgrade.cpuRequirement;
          const gpuRequirementMet = totalGPU >= upgrade.gpuRequirement;
          const requirementsMet = cpuRequirementMet && gpuRequirementMet;
          
          upgradeHTML += `
            <div class="device-listing">
              <div class="device-info">
                <div class="device-name">${upgrade.name}</div>
                <div class="device-specs">${upgrade.description}</div>
                <div class="device-price">${upgrade.costCC} CC</div>
                ${upgrade.cpuRequirement > 0 ? `<div class="device-specs">Requires ${upgrade.cpuRequirement} CPU Power ${cpuRequirementMet ? '✓' : '✗'}</div>` : ''}
                ${upgrade.gpuRequirement > 0 ? `<div class="device-specs">Requires ${upgrade.gpuRequirement} GPU Power ${gpuRequirementMet ? '✓' : '✗'}</div>` : ''}
              </div>
              <button class="purchase-button" data-upgrade-id="${upgrade.id}" ${(!canAfford || !requirementsMet) ? 'disabled' : ''}>
                ${!canAfford ? 'Can\'t Afford' : (!requirementsMet ? 'Requirements Not Met' : 'Purchase')}
              </button>
            </div>
          `;
        });
      }
      
      upgradeHTML += `
        <button class="hack-button" style="margin-top: 20px;" id="back-to-home">Back to Directory</button>
        </div>
      `;
      
      browserContent.innerHTML = upgradeHTML;
      break;
      
    case "forum":
      address += "forum";
      // Generate device listings
      let forumHTML = `
        <div class="dark-web-home">
          <h2>Dark Forum</h2>
          <p style="color: #aaa; margin-bottom: 20px;">Leaked access information to various targets.</p>
      `;
      
      // Filter for unpurchased but visible devices
      const availableDevices = allDevices.filter(d => !d.isPurchased && !d.isCompromised);
      
      if (availableDevices.length === 0) {
        forumHTML += `<p style="color: #aaa; text-align: center; padding: 20px;">No available targets. You've purchased all available access information.</p>`;
      } else {
        // Identify affordable devices and the next one
        const affordableDevices = availableDevices.filter(d => gameState.cryptocurrency >= d.costCC);
        let nextDeviceIndex = -1;
        
        // If there are unaffordable devices, find the index of the first one after all affordable ones
        if (affordableDevices.length < availableDevices.length) {
          // Sort by cost to ensure we're showing the next logical device
          const sortedDevices = [...availableDevices].sort((a, b) => a.costCC - b.costCC);
          // Find first unaffordable device
          const firstUnaffordable = sortedDevices.find(d => gameState.cryptocurrency < d.costCC);
          if (firstUnaffordable) {
            nextDeviceIndex = availableDevices.findIndex(d => d.id === firstUnaffordable.id);
          }
        }
        
        availableDevices.forEach((device, index) => {
          // Calculate if player can afford the device
          const canAfford = gameState.cryptocurrency >= device.costCC;
          // Determine if this device should be blurred (not affordable and not the next device)
          const shouldBlur = !canAfford && index !== nextDeviceIndex;
          
          forumHTML += `
            <div class="device-listing ${shouldBlur ? 'blurred-device' : ''}">
              <div class="device-info">
                <div class="device-name">${device.name}</div>
                <div class="device-specs">Difficulty: ${device.requiredAttempts} PA</div>
                <div class="device-specs">CPU: ${device.cpuPower} | GPU: ${device.gpuPower}</div>
                <div class="device-price">${device.costCC} CC</div>
              </div>
              <button class="purchase-button" data-device-id="${device.id}" ${!canAfford ? 'disabled' : ''}>
                ${!canAfford ? 'Can\'t Afford' : 'Purchase Access'}
              </button>
            </div>
          `;
        });
      }
      
      forumHTML += `
        <button class="hack-button" style="margin-top: 20px;" id="back-to-home">Back to Directory</button>
        </div>
      `;
      
      browserContent.innerHTML = forumHTML;
      break;
  }
  
  addressBar.textContent = address;
  
  // Add event listeners to the browser navigation elements
  setupBrowserEvents();
};

/**
 * Sets up event listeners for all browser elements
 */
const setupBrowserEvents = () => {
  // Back button - always goes home (simplified to avoid freezes)
  const backButton = document.getElementById("browser-back");
  if (backButton) {
    // Remove any existing event listeners by cloning and replacing the element
    const newBackButton = backButton.cloneNode(true);
    backButton.parentNode.replaceChild(newBackButton, backButton);
    
    newBackButton.addEventListener("click", () => {
      // Always navigate to home page regardless of current page
      navigateBrowser("home");
    });
  }
  
  // Refresh button - now just decorative, no functionality
  const refreshButton = document.getElementById("browser-refresh");
  if (refreshButton) {
    // Remove any existing event listeners by cloning and replacing the element
    const newRefreshButton = refreshButton.cloneNode(true);
    refreshButton.parentNode.replaceChild(newRefreshButton, refreshButton);
    
    // No functionality added
  }
  
  // Use event delegation for browser content to prevent missing clicks during refreshes
  const browserContent = document.getElementById("browser-content");
  if (browserContent && !browserContent.hasAttribute("data-has-listeners")) {
    browserContent.setAttribute("data-has-listeners", "true");
    
    // Add a single event listener to the container that handles all click events
    browserContent.addEventListener("click", (event) => {
      // Site links
      if (event.target.closest(".site-link")) {
        const link = event.target.closest(".site-link");
        const page = link.getAttribute("data-page");
        if (page) {
          navigateBrowser(page);
        }
        return;
      }
      
      // Back to home button
      if (event.target.id === "back-to-home" || event.target.closest("#back-to-home")) {
        navigateBrowser("home");
        return;
      }
      
      // Upgrade purchase buttons
      if (event.target.closest(".purchase-button[data-upgrade-id]")) {
        const button = event.target.closest(".purchase-button[data-upgrade-id]");
        if (!button.disabled) {
          const upgradeId = parseInt(button.getAttribute("data-upgrade-id"));
          buyUpgrade(upgradeId);
          // Refresh the page to show the updated state
          navigateBrowser("marketplace");
        }
        return;
      }
      
      // Device purchase buttons
      if (event.target.closest(".purchase-button[data-device-id]")) {
        const button = event.target.closest(".purchase-button[data-device-id]");
        if (!button.disabled) {
          const deviceId = parseInt(button.getAttribute("data-device-id"));
          purchaseDevice(deviceId);
          // Refresh the page to show the updated state
          navigateBrowser("forum");
        }
        return;
      }
    });
  }
  
  // We don't need these individual button handlers anymore
  // They're replaced by the event delegation above
};
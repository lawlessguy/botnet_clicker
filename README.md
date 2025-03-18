# CodeBreak: Botnet Domination

CodeBreak is a hacking-themed incremental game where you build and manage your own botnet by cracking passwords, compromising devices, and installing cryptocurrency miners across a network of controlled machines.

![CodeBreak Game Screenshot](screenshot.png)

## Overview

In CodeBreak, you start with a simple laptop and must work your way up to controlling an entire network of compromised machines. Hack into devices, earn cryptocurrency, purchase upgrades, and eventually reach a state where you can reset for permanent bonuses.

## Features

- **Realistic Hacking Simulation**: Crack passwords, compromise devices, and build your botnet
- **Cryptocurrency Mining**: Run miners on compromised machines to generate income
- **Desktop-style UI**: Manage multiple windows including hack console, botnet control panel, and crypto wallet
- **Dark Web Interface**: Purchase new targets and upgrades through a simulated TorX browser
- **Prestige System**: Reset your progress to gain permanent bonuses with Master Key tokens
- **Save & Load**: Export and import save codes to continue your progress
- **Progressive Difficulty**: From simple student laptops to government mainframes and quantum computers

## How to Play

1. **Start Mining**: Open the Personal Crypto Miner and type `start` to begin earning cryptocurrency
2. **Buy Your First Target**: Once you have 25 CC (cryptocurrency), open the TorX Browser from the Upgrade Store button and navigate to the Dark Forum to purchase access to your first target
3. **Hack Devices**: Use the Hack Console to select targets and perform password cracking attempts
4. **Install Miners**: After compromising a device, install a crypto miner on it from the Botnet Control Panel
5. **Upgrade Your System**: Purchase upgrades from the TorX Browser's Black Market to improve your hacking efficiency
6. **Expand Your Botnet**: Continue compromising higher-tier devices and growing your network
7. **Prestige**: Once you've accumulated 1,000,000 password attempts, activate the Global Master Key to reset with permanent bonuses

## Game Windows

- **Personal Crypto Miner**: Terminal interface for mining cryptocurrency on your own machine
- **Hack Console**: Select and hack target machines
- **Botnet Control Panel**: Manage compromised machines and install miners
- **Crypto Wallet**: Track your cryptocurrency balance and transaction history
- **TorX Browser**: Access the dark web for purchasing targets and upgrades
- **System Performance**: Monitor resource generation rates and prestige progress
- **Settings**: Save and load game progress

## Progression

The game features 30 devices across 6 tiers of progression:

1. **Personal Devices**: Student laptops, desktops, and gaming PCs
2. **Home Network**: Routers, NAS servers, and mining rigs
3. **Small Business**: Office equipment and web hosting servers
4. **Corporate**: Firewalls, database servers, and data centers
5. **Government/Research**: University servers, financial institutions, and government databases
6. **Advanced/Specialized**: AI clusters, quantum computing labs, and global network infrastructure

## Technical Details

CodeBreak is built using HTML, CSS, and pure JavaScript with no external libraries or frameworks. The game uses a modular design with separate files for different aspects of functionality:

- Window management system
- Game logic
- UI updates
- Browser simulation
- Mining simulation
- Save/load functionality

## Installation

1. Clone this repository or download the files
2. Open `index.html` in a modern web browser
3. No build steps or dependencies required!

## Development

The game code is organized into several JavaScript modules:

- `config.js`: Game settings, device and upgrade definitions
- `data.js`: Core game state and constants
- `windowManager.js`: Handles window creation, movement, and management
- `gameLogic.js`: Core gameplay mechanics
- `uiManager.js`: Updates UI elements based on game state
- `browserManager.js`: Simulates the in-game web browser
- `minerManager.js`: Controls cryptocurrency mining
- `saveManager.js`: Handles save/load functionality
- `main.js`: Entry point and game loop

## License

This game is released under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0). This means you are free to:

- Share: Copy and redistribute the game
- Adapt: Remix, transform, and build upon the game

Under the following terms:
- Attribution: You must give appropriate credit to the original creator
- NonCommercial: You may not use this game for commercial purposes
- ShareAlike: If you remix, transform, or build upon this game, you must distribute your contributions under the same license

For more information, visit: https://creativecommons.org/licenses/by-nc-sa/4.0/

## Credits

Created by [Lawlessguy]. All game assets and code are original creations.

---

Enjoy building your botnet empire, and happy hacking! 
# Ball-Tower-Cllimber

## Overview

**Ball Tower Climber** is a dynamic, physics-based platformer where players control a ball navigating procedurally generated platforms. The game features multiple ball types with unique physics, permanent upgrades, and increasing difficulty as players climb higher. With minimalist 2D graphics rendered in HTML5 Canvas, it offers strategic depth through ball selection and upgrade management.

## Game Concept

Players control a ball that automatically jumps while moving left/right to land on platforms. The goal is to climb as high as possible without falling. Unlike classic Icy Tower clones, this game introduces multiple ball transformations with distinct physics and upgrade systems, making each run dynamic and replayable.

## Core Gameplay Mechanics

### Basic Controls
- **Desktop**: Arrow keys (←/→) or A/D for movement, Space/W to jump, P to pause, ESC to return to menu
- **Mobile**: Touch/swipe controls or device tilt (accelerometer) with automatic jump and boost activation
- **Wall Boost**: On desktop, activate by quickly pressing opposite direction key after wall bounce

### Physics System
- Realistic ball physics with gravity, acceleration, and friction
- Wall bouncing with momentum preservation
- Wind system affecting certain ball types
- Continuous Collision Detection for high-velocity movement

### Platform Types
1. **Normal Platforms** (gray): Standard stationary platforms
2. **Moving Platforms** (blue): Horizontally moving platforms
3. **Shrinking Platforms** (green): Gradually decrease in width
4. **Breaking Platforms** (red): Disappear after being landed on
5. **Special Platforms** (lighter red): Full-width platforms appearing every 100 floors

### Special Features
- **Wall Boost**: Execute boosts by pressing opposite direction when near walls (automatic on mobile)
- **Coin Collection**: Collect coins to unlock new balls and upgrades
- **Cannon Platforms**: Special launchers providing vertical boosts (golf ball only)
- **Difficulty Scaling**: Platforms become more challenging as player climbs higher

## Ball Types & Transformations

### 1. Standard Ball
- **Physics**: Balanced acceleration and jump force
- **Special**: No special abilities
- **Upgrades**: Speed, Jump, Coin Magnet

### 2. Gum (Rubber) Ball
- **Physics**: High bounce factor, faster acceleration
- **Special**: Enhanced wall boosting with stronger vertical lift
- **Unlock Cost**: 50 coins
- **Upgrades**: Speed, Jump, Wall Boost

### 3. Beach Ball
- **Physics**: Larger radius, slower movement, lower gravity
- **Special**: Affected by wind system - wind pushes ball horizontally
- **Unlock Cost**: 100 coins
- **Upgrades**: Speed, Jump, Wind Resistance

### 4. Golf Ball
- **Physics**: Small radius, high maximum speed
- **Special**: Can use cannon platforms for massive vertical boosts
- **Unlock Cost**: 150 coins
- **Upgrades**: Speed, Jump, Cannon Boost

## Upgrade System

Upgrades are specific to each ball type and can be toggled on/off:

**Standard Ball**: Speed, Jump, Coin Magnet  
**Gum Ball**: Speed, Jump, Wall Boost  
**Beach Ball**: Speed, Jump, Wind Resistance  
**Golf Ball**: Speed, Jump, Cannon Boost  

Each upgrade has 3 levels with increasing effects and costs.

## Game Progression

### Scoring & Economy
- **Height Score**: Points based on floors climbed
- **Coin Collection**: Coins collected during gameplay, used to unlock balls/upgrades
- **High Score**: Best floor reached (persists between sessions)

### Difficulty Curve
- **Starting**: Wide, stationary platforms
- **Progressive**: Moving, shrinking, and breaking platforms appear more frequently
- **Floor Fading**: Lower platforms disappear as player climbs higher
- **Wind Effects**: Random wind bursts affect certain ball types

## UI & Interface

### Main Screens
1. **Start Screen**: Main menu with play, ball selection, upgrades, settings
2. **Game Screen**: Gameplay area with HUD
3. **Balls Screen**: Ball selection and unlocking
4. **Upgrades Screen**: Upgrade management
5. **Settings Screen**: Control options

### HUD Elements
- **Score Display**: Current floor count
- **Coin Counter**: Coins collected in current game
- **Pause Button**: Access pause menu

### Control Settings
- **Mobile Controls**: Auto-jump and auto-boost for touch devices
- **Accelerometer**: Optional tilt controls on supported devices
- **Desktop Controls**: Manual jump (Space/W) and boost activation

## Technical Implementation

### Architecture
- **Canvas Rendering**: HTML5 Canvas for graphics
- **Responsive Design**: Adapts to mobile/desktop screens
- **Service Worker**: Offline capability and caching
- **Local Storage**: Persistent save data

### Physics Engine
Custom implementation featuring velocity-based movement, collision detection, wind simulation, and magnet systems.

### Platform Generation
Procedural algorithm creating varied platform types while ensuring reachability and performance.

## Installation & Running

### Web Version
Open `index.html` in a modern browser. Works offline after initial load.

### PWA Installation
Install as Progressive Web App via "Add to Home Screen" on mobile browsers.

### Development
- `index.html` - Main HTML
- `style.css` - Styling
- `js/config.js` - Configuration
- `js/game.js` - Core logic
- `js/menu.js` - UI management
- `service-worker.js` - Offline functionality

## Future Considerations
Potential enhancements include additional ball types, more platform varieties, visual themes, sound effects, and achievement systems.

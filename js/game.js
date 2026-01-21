window.Game = {
    
    init() {
        console.log('Game.init() - Initializing game');

        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        
        this.resizeCanvas();
        
        
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
        
        
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.resizeCanvas();
                this.handleOrientationChange();
            }, 100);
        });

        this.isPaused = false;
        this.isGameOver = false;
        this.gameStarted = false;
        this.gameLoopRunning = false;

        this.initPlayer();
        this.initSystems();
        this.initEventListeners();
        this.applySettings(); 

        console.log('Game initialized - Responsive mode active');
    },
    
    
    handleOrientationChange() {
        
        this.initEventListeners();
        
        
        this.applySettings();
        
        
        if (this.gameStarted && window.Menu) {
            window.Menu.updateGameHUD();
        }
    },
    
    resizeCanvas() {
        const container = document.getElementById('game-container');
        if (!container || !this.canvas) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.height || container.clientHeight;

        
        const targetRatio = GameConfig.CANVAS_WIDTH / GameConfig.CANVAS_HEIGHT;
        const containerRatio = containerWidth / containerHeight;

        let scale;
        let renderWidth, renderHeight;

        if (containerRatio > targetRatio) {
            
            scale = containerHeight / GameConfig.CANVAS_HEIGHT;
            renderHeight = containerHeight;
            renderWidth = GameConfig.CANVAS_WIDTH * scale;
        } else {
            
            scale = containerWidth / GameConfig.CANVAS_WIDTH;
            renderWidth = containerWidth;
            renderHeight = GameConfig.CANVAS_HEIGHT * scale;
        }

        
        this.canvas.style.width = renderWidth + 'px';
        this.canvas.style.height = renderHeight + 'px';

        
        this.canvas.width = GameConfig.CANVAS_WIDTH;
        this.canvas.height = GameConfig.CANVAS_HEIGHT;

        
        this.scaleFactor = scale;
        this.canvasStyleWidth = renderWidth;
        this.canvasStyleHeight = renderHeight;

        
        this.canvasOffsetX = (containerWidth - renderWidth) / 2;
        this.canvasOffsetY = (containerHeight - renderHeight) / 2;

        
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = this.canvasOffsetX + 'px';
        this.canvas.style.top = this.canvasOffsetY + 'px';
        this.canvas.style.transform = 'none'; 

        console.log(`Canvas resized: ${renderWidth}x${renderHeight}, scale: ${scale.toFixed(2)}, offsetX: ${this.canvasOffsetX.toFixed(0)}, offsetY: ${this.canvasOffsetY.toFixed(0)}`);

        
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.backgroundColor = '#000';
        }
    },
    
    
    convertScreenToCanvas(screenX, screenY) {
        
        const rect = this.canvas.getBoundingClientRect();

        
        const x = (screenX - rect.left) / this.scaleFactor;
        const y = (screenY - rect.top) / this.scaleFactor;

        
        return {
            x: Math.max(0, Math.min(x, GameConfig.CANVAS_WIDTH)),
            y: Math.max(0, Math.min(y, GameConfig.CANVAS_HEIGHT))
        };
    },
    
    initPlayer() {
        
        const defaultBallConfig = GameConfig.getBaseBallConfig('standard');
        this.player = {
            x: GameConfig.PLAYER_START_X,
            y: GameConfig.PLAYER_START_Y,
            radius: defaultBallConfig.RADIUS, 
            velocityX: 0,
            velocityY: 0,
            onGround: false,
            isSmall: false
        };
    },
    
    initSystems() {
        this.cameraY = 0;
        
        this.currentHeight = 0;
        this.maxJumpHeight = 0;
        this.startFloorLevel = GameConfig.CANVAS_HEIGHT - 100 - this.player.radius;
        
        this.currentVelocityX = 0;
        this.currentVelocityY = 0;
        this.maxVelocityX = 0;
        this.maxVelocityY = 0;
        
        this.canWallBoost = false;
        this.wallBoostDirection = null;
        this.wallBoostDistance = 0;
        
        this.boostActivated = false;
        this.boostActivatedFrames = 0;
        
        this.floors = [];
        this.currentFloorIndex = 0;
        this.maxFloorReached = 0;
        this.highestFloorEver = 0;
        
        this.floorFadeTimer = 0;
        this.nextFloorToFade = 0;
        this.fadeProcessActive = false;
        
        this.currentDifficulty = 1.0;
        this.difficultyActive = false;
        
        this.movingSpeedMultiplier = 1.0;
        this.movingRangeMultiplier = 1.0;
        this.shrinkingMinWidthMultiplier = 1.0;
        this.shrinkingSpeedMultiplier = 1.0;
        this.shrinkingDelayMultiplier = 1.0;
        this.breakingFadeSpeedMultiplier = 1.0;
        
        this.gameOver = false;
        
        this.keys = {};
        this.keysPressedThisFrame = {};
        
        
        this.touchActive = false;
        this.touchDirection = 0;
        this.tiltX = 0;
        
        this.autoJumpActive = false;
        this.mobileControlsEnabled = false; 
        this.useAccelerometer = false; 
        
        this.coins = [];
        this.collectedCoins = 0;
        this.totalCoins = 0;
        this.coinEffects = [];
        
        this.windActive = false;
        this.windForce = 0;
        this.windDirection = 1;
        this.windTimer = 0;
        this.windDuration = 0;
        this.windBreakDuration = 0;
        this.windRampProgress = 0;
        this.windState = 'break';
        this.windTargetForce = 0;
        this.windStartForce = 0;
        
        this.magnetActive = false;
        this.magnetRange = 0;
        
        this.currentBallType = 'standard';
        this.currentBallConfig = GameConfig.getBaseBallConfig(this.currentBallType);
        this.activeUpgrades = {};
        this.score = 0; 
        this.highScore = 0; 
        this.state = {
            settings: {
                debugInfo: false,
                windDisplay: true,
                autoJump: false,
                mobileControls: false,
                accelerometer: false
            }
        };
        
        this.loadHighScore();
        this.loadTotalCoins();
        this.initWind();
        this.initFloors();
    },
    
    initEventListeners() {
        
        window.addEventListener('keydown', (e) => {
            if (!this.keys[e.key]) {
                this.keysPressedThisFrame[e.key] = true;
            }
            this.keys[e.key] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTouchStart(e);
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleTouchEnd(e);
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleTouchStart(e);
        }, { passive: false });
        
        
        if ('DeviceOrientationEvent' in window) {
            window.addEventListener('deviceorientation', (e) => {
                this.handleDeviceOrientation(e);
            });
        }
        
        
        this.canvas.addEventListener('mousedown', (e) => {
            const pos = this.convertScreenToCanvas(e.clientX, e.clientY);
            
            if (this.mobileControlsEnabled) {
                if (pos.x < GameConfig.CANVAS_WIDTH / 2) {
                    this.touchDirection = -1;
                } else {
                    this.touchDirection = 1;
                }
                this.touchActive = true;
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.touchActive = false;
            this.touchDirection = 0;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.touchActive = false;
            this.touchDirection = 0;
        });
    },
    
    handleTouchStart(e) {
        e.preventDefault();
        
        if (e.touches && e.touches.length > 0) {
            const touch = e.touches[0];
            const pos = this.convertScreenToCanvas(touch.clientX, touch.clientY);
            
            if (this.mobileControlsEnabled) {
                if (pos.x < GameConfig.CANVAS_WIDTH / 2) {
                    this.touchDirection = -1;
                } else {
                    this.touchDirection = 1;
                }
                this.touchActive = true;
            }
        }
    },
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.touchActive = false;
        this.touchDirection = 0;
    },
    
    handleDeviceOrientation(e) {
        if (!this.useAccelerometer) return;
        
        if (e.gamma !== null) {
            this.tiltX = Math.max(-1, Math.min(1, e.gamma / 45));
        }
    },
    
    startGame(ballType = 'standard', upgrades = {}) {
        console.log('Starting game with ball:', ballType, 'upgrades:', upgrades);
        
        this.gameStarted = true;
        this.isPaused = false;
        this.isGameOver = false;
        this.gameOver = false;
        
        this.changeBall(ballType, upgrades);
        
        this.resetGameState();
        
        this.applySettings();

        if (!this.gameLoopRunning) {
            this.gameLoopRunning = true;
            this.gameLoop();
        }
        
        console.log('Game started - Responsive mode');
    },

    setPaused(paused) {
        this.isPaused = paused;
    },

    initGame(ballType, upgrades) {
        return this.startGame(ballType, upgrades);
    },
    
    
    changeBall(ballType, upgrades = {}) {
        this.currentBallType = ballType;
        this.activeUpgrades = upgrades;
        
        
        this.currentBallConfig = GameConfig.getBallConfigWithUpgrades(ballType, { [ballType]: upgrades });
        
        
        this.updatePlayerFromConfig();
        
        
        if (window.Menu) {
            window.Menu.updateGameHUD();
        }
        
        console.log('Changed ball to:', ballType, 'config:', this.currentBallConfig);
    },
    
    
    updatePlayerFromConfig() {
        
        this.player.radius = this.currentBallConfig.RADIUS;
    },
    
    
    resetGameState() {
        
        this.player.x = GameConfig.PLAYER_START_X;
        this.player.y = GameConfig.PLAYER_START_Y;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.player.onGround = false;
        this.player.isSmall = false;
        
        
        this.cameraY = 0;
        
        
        this.currentHeight = 0;
        this.maxJumpHeight = 0;
        this.currentVelocityX = 0;
        this.currentVelocityY = 0;
        this.maxVelocityX = 0;
        this.maxVelocityY = 0;
        this.maxFloorReached = 0;
        this.gameOver = false;
        
        
        this.canWallBoost = false;
        this.wallBoostDirection = null;
        this.wallBoostDistance = 0;
        this.boostActivated = false;
        this.boostActivatedFrames = 0;
        
        
        this.currentDifficulty = 1.0;
        this.difficultyActive = false;
        this.floorFadeTimer = 0;
        this.nextFloorToFade = 0;
        this.fadeProcessActive = false;
        
        
        this.coins = [];
        this.collectedCoins = 0;
        this.coinEffects = [];
        
        
        if (window.Menu) {
            window.Menu.state.coinsInGame = 0;
            window.Menu.state.scoreInGame = 0;
            window.Menu.updateGameHUD();
        }
        
        
        this.touchActive = false;
        this.touchDirection = 0;
        this.tiltX = 0;
        this.autoJumpActive = false;
        
        
        this.initWind();
        
        
        this.floors = [];
        this.initFloors();
        
        
        this.keys = {};
        this.keysPressedThisFrame = {};
        
        
        this.updateGameHUD();
    },
    
    
    applySettings() {
        
        if (window.Menu) {
            const settings = window.Menu.state.settings;

            
            this.state.settings = { ...settings };
            
            
            this.autoJumpActive = settings.autoJump;
            this.mobileControlsEnabled = settings.mobileControls;
            this.useAccelerometer = settings.accelerometer;

            
            const debugInfo = document.getElementById('debug-info');
            if (debugInfo) {
                debugInfo.classList.toggle('hidden', !settings.debugInfo);
            }

            
            GameConfig.AUTO_JUMP_ENABLED = settings.autoJump;
            GameConfig.MOBILE_CONTROLS_ENABLED = settings.mobileControls;
            GameConfig.USE_ACCELEROMETER = settings.accelerometer;
        }
    },
    
    
    
    
    initFloors() {
        this.floors.push(this.generateFloor(0));
        
        for (let i = 1; i <= GameConfig.FLOORS_TO_GENERATE_AHEAD; i++) {
            this.floors.push(this.generateFloor(i));
        }
    },
    
    
    generateFloor(floorNumber) {
        let width, x, color, floorType;
        
        floorType = this.determineFloorType(floorNumber);
        
        switch(floorType) {
            case 'special':
                width = GameConfig.SPECIAL_FLOOR_WIDTH;
                x = (GameConfig.CANVAS_WIDTH - width) / 2;
                color = GameConfig.SPECIAL_FLOOR_COLOR;
                break;
                
            case 'moving':
                width = GameConfig.MOVING_FLOOR_MIN_WIDTH + Math.random() * (GameConfig.MOVING_FLOOR_MAX_WIDTH - GameConfig.MOVING_FLOOR_MIN_WIDTH);
                x = GameConfig.MOVING_FLOOR_MIN_X + Math.random() * (GameConfig.MOVING_FLOOR_MAX_X - GameConfig.MOVING_FLOOR_MIN_X - width);
                color = GameConfig.MOVING_FLOOR_COLOR;
                break;
                
            case 'shrinking':
                width = GameConfig.FLOOR_MIN_WIDTH + Math.random() * (GameConfig.FLOOR_MAX_WIDTH - GameConfig.FLOOR_MIN_WIDTH);
                x = this.getFloorXPosition(floorNumber, width);
                color = GameConfig.SHRINKING_FLOOR_COLOR;
                break;
                
            case 'breaking':
                width = GameConfig.BREAKING_FLOOR_MIN_WIDTH + Math.random() * (GameConfig.BREAKING_FLOOR_MAX_WIDTH - GameConfig.BREAKING_FLOOR_MIN_WIDTH);
                x = this.getFloorXPosition(floorNumber, width);
                color = GameConfig.BREAKING_FLOOR_COLOR;
                break;
                
            default:
                if (floorNumber === 0) {
                    width = GameConfig.START_FLOOR_WIDTH;
                    x = (GameConfig.CANVAS_WIDTH - width) / 2;
                    color = GameConfig.SPECIAL_FLOOR_COLOR;
                } else {
                    width = GameConfig.FLOOR_MIN_WIDTH + Math.random() * (GameConfig.FLOOR_MAX_WIDTH - GameConfig.FLOOR_MIN_WIDTH);
                    x = this.getFloorXPosition(floorNumber, width);
                    color = GameConfig.FLOOR_COLOR;
                }
        }
        
        const y = GameConfig.CANVAS_HEIGHT - 50 - (floorNumber * GameConfig.FLOOR_VERTICAL_SPACING);
        
        let shrinkDelay = 0;
        if (floorType === 'shrinking') {
            shrinkDelay = GameConfig.SHRINKING_FLOOR_START_DELAY * (this.difficultyActive ? this.shrinkingDelayMultiplier : 1.0);
        }
        
        
        let hasCannon = false;
        let cannonSide = null;
        if (GameConfig.CANNON_ENABLED && floorNumber >= 5 && Math.random() < GameConfig.CANNON_CHANCE) {
            hasCannon = true;
            const floorCenter = x + width / 2;
            cannonSide = floorCenter < GameConfig.CANVAS_WIDTH / 2 ? 'right' : 'left';
        }
        
        const floor = {
            number: floorNumber,
            x: x,
            y: y,
            width: width,
            height: GameConfig.FLOOR_HEIGHT,
            color: color,
            type: floorType,
            isSpecial: floorType === 'special' || floorNumber === 0,
            isFading: false,
            fadeAlpha: 1.0,
            movingDirection: floorType === 'moving' ? (Math.random() > 0.5 ? 1 : -1) : 0,
            originalX: floorType === 'moving' ? x : 0,
            originalWidth: floorType === 'shrinking' ? width : width,
            shrinkDelay: shrinkDelay,
            isBreaking: false,
            hasCannon: hasCannon,
            cannonSide: cannonSide,
            shouldRemove: false,
            shrinkingOriginalX: floorType === 'shrinking' ? x : 0,
            coins: []
        };
        
        
        if (GameConfig.COINS_ENABLED) {
            floor.coins = this.generateCoinsForFloor(floor);
            floor.coins.forEach(coin => {
                this.coins.push(coin);
            });
        }
        
        return floor;
    },
    
    
    determineFloorType(floorNumber) {
        
        if (floorNumber % GameConfig.SPECIAL_FLOOR_INTERVAL === 0 && floorNumber >= 5) {
            return 'special';
        }
        
        if (floorNumber === 0) {
            return 'normal';
        }
        
        let movingChance = GameConfig.BASE_MOVING_FLOOR_CHANCE;
        let shrinkingChance = GameConfig.BASE_SHRINKING_FLOOR_CHANCE;
        let breakingChance = GameConfig.BASE_BREAKING_FLOOR_CHANCE;
        
        if (this.difficultyActive) {
            const chanceMultiplier = 1 + (this.currentDifficulty - 1) * 0.5;
            movingChance *= chanceMultiplier;
            shrinkingChance *= chanceMultiplier;
            breakingChance *= chanceMultiplier;
            
            movingChance = Math.min(movingChance, GameConfig.DIFFICULTY_MAX_CHANCE);
            shrinkingChance = Math.min(shrinkingChance, GameConfig.DIFFICULTY_MAX_CHANCE);
            breakingChance = Math.min(breakingChance, GameConfig.DIFFICULTY_MAX_CHANCE);
        }
        
        const rand = Math.random();
        let cumulativeChance = 0;
        
        cumulativeChance += movingChance;
        if (rand < cumulativeChance && GameConfig.MOVING_FLOOR_ENABLED) return 'moving';
        
        cumulativeChance += shrinkingChance;
        if (rand < cumulativeChance && GameConfig.SHRINKING_FLOOR_ENABLED) return 'shrinking';
        
        cumulativeChance += breakingChance;
        if (rand < cumulativeChance && GameConfig.BREAKING_FLOOR_ENABLED) return 'breaking';
        
        return 'normal';
    },
    
    
    generateCoinsForFloor(floor) {
        if (!GameConfig.COINS_ENABLED) return [];
        if (floor.number < GameConfig.MIN_FLOOR_FOR_COINS) return [];
        
        
        let coinChance = GameConfig.COIN_CHANCE_BASE + (floor.number * GameConfig.COIN_CHANCE_PER_FLOOR);
        coinChance = Math.min(coinChance, GameConfig.COIN_MAX_CHANCE);
        
        if (Math.random() > coinChance) return [];
        
        
        const baseCoins = GameConfig.MIN_COINS_PER_FLOOR + 
            Math.floor(Math.random() * (GameConfig.MAX_COINS_PER_FLOOR - GameConfig.MIN_COINS_PER_FLOOR + 1));
        const coinMultiplier = Math.pow(GameConfig.COINS_PER_FLOOR_MULTIPLIER, floor.number);
        const numCoins = Math.min(Math.floor(baseCoins * coinMultiplier), GameConfig.MAX_COINS_PER_FLOOR);
        
        const floorCoins = [];
        const margin = GameConfig.COIN_RADIUS * 3;
        
        for (let i = 0; i < numCoins; i++) {
            const minX = floor.x + margin;
            const maxX = floor.x + floor.width - margin;
            const x = minX + Math.random() * (maxX - minX);
            const y = floor.y + GameConfig.COIN_Y_OFFSET;
            
            floorCoins.push({
                id: Math.random().toString(36).substr(2, 9),
                x: x,
                y: y,
                radius: GameConfig.COIN_RADIUS,
                floorNumber: floor.number,
                collected: false,
                originalX: x,
                originalY: y
            });
        }
        
        return floorCoins;
    },
    
    
    getFloorXPosition(floorNumber, width) {
        let x;
        
        if (this.floors.length > 0) {
            const prevFloor = this.floors[this.floors.length - 1];
            const minX = Math.max(
                GameConfig.WALL_LEFT_X + GameConfig.WALL_THICKNESS + GameConfig.FLOOR_MARGIN,
                prevFloor.x - GameConfig.FLOOR_MAX_HORIZONTAL_GAP
            );
            const maxX = Math.min(
                GameConfig.WALL_RIGHT_X - GameConfig.WALL_THICKNESS - GameConfig.FLOOR_MARGIN - width,
                prevFloor.x + prevFloor.width + GameConfig.FLOOR_MAX_HORIZONTAL_GAP - width
            );
            
            if (minX > maxX) {
                x = (GameConfig.CANVAS_WIDTH - width) / 2;
            } else {
                x = minX + Math.random() * (maxX - minX);
            }
        } else {
            x = GameConfig.WALL_LEFT_X + GameConfig.WALL_THICKNESS + GameConfig.FLOOR_MARGIN + 
                Math.random() * (GameConfig.CANVAS_WIDTH - 2 * (GameConfig.WALL_THICKness + GameConfig.FLOOR_MARGIN) - width);
        }
        
        return x;
    },
    
    
    generateMoreFloorsIfNeeded() {
        const highestGeneratedFloor = this.floors.length > 0 ? 
            Math.max(...this.floors.map(f => f.number)) : 0;
        
        const playerFloorNumber = Math.floor((GameConfig.CANVAS_HEIGHT - 50 - this.player.y) / GameConfig.FLOOR_VERTICAL_SPACING);
        
        if (playerFloorNumber + GameConfig.FLOORS_TO_GENERATE_AHEAD > highestGeneratedFloor) {
            const floorsToGenerate = (playerFloorNumber + GameConfig.FLOORS_TO_GENERATE_AHEAD) - highestGeneratedFloor;
            
            for (let i = 1; i <= floorsToGenerate; i++) {
                const newFloor = this.generateFloor(highestGeneratedFloor + i);
                this.floors.push(newFloor);
            }
        }
        
        const lowestNeededFloor = playerFloorNumber - GameConfig.FLOORS_TO_GENERATE_BEHIND;
        
        this.coins = this.coins.filter(coin => coin.floorNumber >= lowestNeededFloor);
        this.floors = this.floors.filter(floor => floor.number >= lowestNeededFloor && floor.number >= 0);
    },
    
    
    
    
    initWind() {
        console.log('initWind() - initializing wind system');

        this.windActive = false;
        this.windForce = 0;
        this.windDirection = Math.random() > 0.5 ? 1 : -1;
        this.windState = 'break';

        
        const minBreak = this.currentBallConfig.WIND_MIN_BREAK_DURATION;
        const maxBreak = this.currentBallConfig.WIND_MAX_BREAK_DURATION;

        this.windTimer = Math.floor(minBreak + Math.random() * (maxBreak - minBreak));
        this.windBreakDuration = this.windTimer;
        this.windTargetForce = 0;
        this.windStartForce = 0;
        this.windRampProgress = 0;

        console.log(`initWind - timer: ${this.windTimer}, state: ${this.windState}, ball: ${this.currentBallType}`);
    },
    
    updateWind() {
        
        if (!this.currentBallConfig.WIND_ENABLED) {
            if (this.windForce !== 0) {
                this.windForce = 0;
                this.windActive = false;
            }
            return;
        }

        this.windTimer--;

        
        const WIND_MIN_FORCE = this.currentBallConfig.WIND_MIN_FORCE;
        const WIND_MAX_FORCE = this.currentBallConfig.WIND_MAX_FORCE;
        const WIND_MIN_BURST_DURATION = this.currentBallConfig.WIND_MIN_BURST_DURATION;
        const WIND_MAX_BURST_DURATION = this.currentBallConfig.WIND_MAX_BURST_DURATION;
        const WIND_MIN_BREAK_DURATION = this.currentBallConfig.WIND_MIN_BREAK_DURATION;
        const WIND_MAX_BREAK_DURATION = this.currentBallConfig.WIND_MAX_BREAK_DURATION;
        const WIND_RAMP_UP_MIN_TIME = this.currentBallConfig.WIND_RAMP_UP_MIN_TIME;
        const WIND_RAMP_UP_MAX_TIME = this.currentBallConfig.WIND_RAMP_UP_MAX_TIME;
        const WIND_RAMP_DOWN_MIN_TIME = this.currentBallConfig.WIND_RAMP_DOWN_MIN_TIME;
        const WIND_RAMP_DOWN_MAX_TIME = this.currentBallConfig.WIND_RAMP_DOWN_MAX_TIME;

        switch (this.windState) {
            case 'break':
                if (this.windTimer <= 0) {
                    this.windState = 'ramp_up';
                    this.windRampProgress = 0;
                    const rampUpTime = Math.floor(
                        WIND_RAMP_UP_MIN_TIME + 
                        Math.random() * (WIND_RAMP_UP_MAX_TIME - WIND_RAMP_UP_MIN_TIME)
                    );
                    this.windTimer = rampUpTime;
                    this.windDirection = Math.random() > 0.5 ? 1 : -1;
                    this.windDuration = Math.floor(
                        WIND_MIN_BURST_DURATION + 
                        Math.random() * (WIND_MAX_BURST_DURATION - WIND_MIN_BURST_DURATION)
                    );
                    
                    const targetForceMagnitude = WIND_MIN_FORCE + 
                        Math.random() * (WIND_MAX_FORCE - WIND_MIN_FORCE);
                    this.windTargetForce = targetForceMagnitude * this.windDirection;
                }
                break;

            case 'ramp_up':
                this.windRampProgress = 1 - (this.windTimer / (this.windTimer + 1));
                this.windForce = this.windRampProgress * this.windTargetForce;
                this.windActive = true;

                if (this.windTimer <= 0) {
                    this.windState = 'active';
                    this.windTimer = this.windDuration;
                    this.windForce = this.windTargetForce;
                }
                break;

            case 'active':
                if (this.windTimer <= 0) {
                    this.windState = 'ramp_down';
                    this.windRampProgress = 1;
                    this.windStartForce = this.windForce;
                    const rampDownTime = Math.floor(
                        WIND_RAMP_DOWN_MIN_TIME + 
                        Math.random() * (WIND_RAMP_DOWN_MAX_TIME - WIND_RAMP_DOWN_MIN_TIME)
                    );
                    this.windTimer = rampDownTime;
                }
                break;

            case 'ramp_down':
                this.windRampProgress = this.windTimer / (this.windTimer + 1);
                this.windForce = this.windRampProgress * this.windStartForce;

                if (this.windTimer <= 0) {
                    this.windState = 'break';
                    this.windActive = false;
                    this.windForce = 0;
                    this.windTimer = Math.floor(
                        WIND_MIN_BREAK_DURATION + 
                        Math.random() * (WIND_MAX_BREAK_DURATION - WIND_MIN_BREAK_DURATION)
                    );
                    this.windBreakDuration = this.windTimer;
                    this.windTargetForce = 0;
                    this.windStartForce = 0;
                }
                break;
        }

        this.applyWindForce();
    },
    
    
    applyWindForce() {
        
        if (!this.currentBallConfig.WIND_ENABLED) {
            return;
        }

        const windAffectsGrounded = this.currentBallConfig.WIND_AFFECTS_GROUNDED;
        const windAffectsAir = this.currentBallConfig.WIND_AFFECTS_AIR;
        const windAirMultiplier = this.currentBallConfig.WIND_AIR_MULTIPLIER;

        
        if ((this.player.onGround && !windAffectsGrounded) || (!this.player.onGround && !windAffectsAir)) {
            return;
        }

        let windMultiplier = 1.0;

        
        if (!this.player.onGround && windAffectsAir) {
            windMultiplier = windAirMultiplier;
        }

        
        const windForce = this.windForce * windMultiplier;
        this.player.velocityX += windForce;
    },
    
    renderWindArrow() {
        
        
        const ballHasWind = this.currentBallConfig.WIND_ENABLED;
        
        const windIsActive = this.windState !== 'break';
        
        const windIsBlowing = Math.abs(this.windForce) > 0.001;

        if (!ballHasWind || !windIsActive || !windIsBlowing) return;

        
        const arrowX = GameConfig.CANVAS_WIDTH - 50;
        const arrowY = 100; 
        const arrowSize = 25;
        const arrowLength = 40;

        this.ctx.save();
        this.ctx.translate(arrowX, arrowY);

        
        
        if (this.windDirection === -1) {
            this.ctx.rotate(Math.PI); 
        }

        
        
        let forceRatio = 0;

        if (this.windState === 'ramp_up') {
            
            forceRatio = Math.abs(this.windForce) / Math.abs(this.windTargetForce);
        } else if (this.windState === 'active') {
            
            forceRatio = 1.0;
        } else if (this.windState === 'ramp_down') {
            
            forceRatio = Math.abs(this.windForce) / Math.abs(this.windStartForce);
        }

        
        forceRatio = Math.max(0, Math.min(1, forceRatio));

        
        const alpha = 0.3 + 0.7 * forceRatio;

        this.ctx.globalAlpha = alpha;
        this.ctx.strokeStyle = "#87CEEB"; 
        this.ctx.fillStyle = "#87CEEB";
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        
        this.ctx.beginPath();

        
        this.ctx.moveTo(-arrowLength/2, 0);
        this.ctx.lineTo(arrowLength/2, 0);

        
        this.ctx.moveTo(arrowLength/2 - 1, 0);
        this.ctx.lineTo(arrowLength/2 - 15, -8);
        this.ctx.lineTo(arrowLength/2 - 15, 8);
        this.ctx.closePath();

        this.ctx.fill();
        this.ctx.stroke();

        
        this.ctx.globalAlpha = 1.0;
        const displayValue = this.windForce*100
        this.ctx.restore(); 
        this.ctx.fillStyle = "#87CEEB";
        this.ctx.font = "14px monospace";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "top";
        
        this.ctx.globalAlpha = alpha;
        this.ctx.fillText(`${Math.abs(displayValue).toFixed(2)}`, arrowX, arrowY + 20);
        this.ctx.globalAlpha = 1.0;
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "alphabetic";
    },

    

    
    checkCoinCollisions() {
        if (!GameConfig.COINS_ENABLED) return;
        
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            
            if (coin.collected) continue;
            
            
            if (this.magnetActive && this.currentBallConfig.MAGNET_ENABLED) {
                this.applyMagnetForce(coin);
            }
            
            
            const dx = this.player.x - coin.x;
            const dy = this.player.y - coin.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.player.radius + coin.radius) {
                
                this.collectCoin(i, coin);
            }
        }
    },
    
    
    collectCoin(coinIndex, coin) {
        coin.collected = true;
        this.collectedCoins++;

        
        if (window.Menu) {
            window.Menu.state.coinsInGame = this.collectedCoins;
            window.Menu.updateGameHUD();
        }

        
        if (GameConfig.COIN_COLLECT_EFFECT_ENABLED) {
            this.coinEffects.push({
                x: coin.x,
                y: coin.y,
                radius: coin.radius,
                duration: GameConfig.COIN_COLLECT_EFFECT_DURATION,
                maxDuration: GameConfig.COIN_COLLECT_EFFECT_DURATION,
                color: GameConfig.COIN_COLLECT_EFFECT_COLOR
            });
        }

        
        this.coins.splice(coinIndex, 1);
    },

    
    applyMagnetForce(coin) {
        const dx = this.player.x - coin.x;
        const dy = this.player.y - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        
        if (distance < this.magnetRange) {
            
            const dirX = dx / distance;
            const dirY = dy / distance;
            
            
            const force = (1 - distance / this.magnetRange) * this.currentBallConfig.MAGNET_FORCE;
            
            coin.x += dirX * force;
            coin.y += dirY * force;
        }
    },
    
    
    updateCoinEffects() {
        if (!GameConfig.COIN_COLLECT_EFFECT_ENABLED) return;
        
        for (let i = this.coinEffects.length - 1; i >= 0; i--) {
            const effect = this.coinEffects[i];
            effect.duration--;
            
            if (effect.duration <= 0) {
                this.coinEffects.splice(i, 1);
            }
        }
    },
    
    
    renderCoinCounter() {
        if (!this.state.settings.debugInfo) return;
        
        this.ctx.fillStyle = GameConfig.COIN_COUNTER_COLOR;
        this.ctx.font = GameConfig.COIN_COUNTER_FONT;
        this.ctx.textAlign = "right";
        
        
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        this.ctx.fillRect(GameConfig.COIN_COUNTER_POS_X - 120, GameConfig.COIN_COUNTER_POS_Y - 20, 110, 30);
        
        
        this.ctx.beginPath();
        this.ctx.arc(GameConfig.COIN_COUNTER_POS_X - 15, GameConfig.COIN_COUNTER_POS_Y, 8, 0, Math.PI * 2);
        this.ctx.fillStyle = GameConfig.COIN_COLOR;
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(GameConfig.COIN_COUNTER_POS_X - 15, GameConfig.COIN_COUNTER_POS_Y, 6, 0, Math.PI * 2);
        this.ctx.fillStyle = GameConfig.COIN_OUTLINE_COLOR;
        this.ctx.fill();
        
        
        this.ctx.fillStyle = GameConfig.COIN_COUNTER_COLOR;
        this.ctx.fillText(`${this.collectedCoins}`, GameConfig.COIN_COUNTER_POS_X - 25, GameConfig.COIN_COUNTER_POS_Y + 5);
        
        this.ctx.textAlign = "left";
    },
    
    
    
    
    updateInput() {
        
        this.keysPressedThisFrame['a'] = false;
        this.keysPressedThisFrame['d'] = false;
        this.keysPressedThisFrame[' '] = false;
        this.keysPressedThisFrame['w'] = false;
        this.keysPressedThisFrame['ArrowUp'] = false;
        this.keysPressedThisFrame['ArrowLeft'] = false;
        this.keysPressedThisFrame['ArrowRight'] = false;

        
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.player.velocityX -= this.currentBallConfig.ACCELERATION;
            if (this.keys['a'] && !this.keys['ArrowLeft']) {
                this.keysPressedThisFrame['a'] = true;
            }
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.player.velocityX += this.currentBallConfig.ACCELERATION;
            if (this.keys['d'] && !this.keys['ArrowRight']) {
                this.keysPressedThisFrame['d'] = true;
            }
        }

        
        if (this.mobileControlsEnabled && this.touchActive) {
            if (this.touchDirection === -1) {
                this.player.velocityX -= this.currentBallConfig.ACCELERATION;
            } else if (this.touchDirection === 1) {
                this.player.velocityX += this.currentBallConfig.ACCELERATION;
            }
        }

        
        if (this.useAccelerometer) {
            if (Math.abs(this.tiltX) > 0.1) {
                this.player.velocityX += this.tiltX * this.currentBallConfig.ACCELERATION * 2;
            }
        }

        
        const maxSpeed = this.currentBallConfig.MAX_SPEED;
        if (this.player.velocityX > maxSpeed) this.player.velocityX = maxSpeed;
        if (this.player.velocityX < -maxSpeed) this.player.velocityX = -maxSpeed;

        
        if (this.player.onGround) {
            this.player.velocityX *= this.currentBallConfig.GROUND_FRICTION;
        } else {
            this.player.velocityX *= this.currentBallConfig.AIR_RESISTANCE;
        }

        
        this.autoJumpActive = this.state.settings.autoJump;

        
        const canJump = this.player.onGround && this.player.velocityY >= 0;

        
        if (this.autoJumpActive && canJump) {
            this.performJump();
        } 
        
        else if (!this.autoJumpActive && (this.keys['ArrowUp'] || this.keys['w'] || this.keys[' ']) && canJump) {
            this.performJump();
        }
    },
    
    
    performJump() {
        const baseJumpForce = this.currentBallConfig.BASE_JUMP_FORCE;
        const maxJumpBonus = this.currentBallConfig.MAX_JUMP_BONUS;
        const maxSpeed = this.currentBallConfig.MAX_SPEED;
        
        const speedRatio = Math.abs(this.player.velocityX) / maxSpeed;
        const jumpForce = baseJumpForce + (maxJumpBonus * speedRatio);
        this.player.velocityY = jumpForce;
        this.player.onGround = false;
    },

    
    checkFloorCollisions() {
        const previousY = this.player.y - this.player.velocityY;
        const previousBottom = previousY + this.player.radius;
        const currentBottom = this.player.y + this.player.radius;

        
        this.player.onGround = false;

        
        
        if (this.player.velocityY <= 0) {
            
            
            for (const floor of this.floors) {
                if (this.isPlayerOnFloor(floor, false)) { 
                    this.player.onGround = true;
                    break;
                }
            }
            return;
        }

        
        for (const floor of this.floors) {
            if (floor.fadeAlpha <= 0) continue;
            if (floor.isFading && floor.fadeAlpha < GameConfig.FADING_FLOOR_MIN_ALPHA_FOR_COLLISION) continue;

            if (floor.type === 'breaking' && floor.isBreaking && !floor.isFading) {
                if (floor.fadeAlpha < GameConfig.FADING_FLOOR_MIN_ALPHA_FOR_COLLISION) continue;
            }

            const floorTop = floor.y;

            
            const leftBound = floor.x - this.player.radius;
            const rightBound = floor.x + floor.width + this.player.radius;

            if (this.player.x < leftBound || this.player.x > rightBound) {
                continue;
            }

            
            if (previousBottom <= floorTop && currentBottom >= floorTop) {
                
                this.player.y = floorTop - this.player.radius;
                this.player.velocityY = 0;
                this.player.onGround = true;

                if (floor.type === 'breaking' && !floor.isBreaking) {
                    floor.isBreaking = true;
                }

                this.canWallBoost = false;
                this.wallBoostDirection = null;
                this.boostActivated = false;
                this.boostActivatedFrames = 0;

                break;
            }
        }
    },

    
    isPlayerOnFloor(floor, allowNewLanding = true) {
        if (floor.fadeAlpha <= 0) return false;
        if (floor.isFading && floor.fadeAlpha < GameConfig.FADING_FLOOR_MIN_ALPHA_FOR_COLLISION) return false;

        const floorTop = floor.y;
        const playerBottom = this.player.y + this.player.radius;

        
        const verticalDistance = playerBottom - floorTop;

        
        if (!allowNewLanding && verticalDistance < 0) {
            return false;
        }

        
        if (verticalDistance < -5 || verticalDistance > 5) {
            return false;
        }

        
        const isInXRange = this.player.x >= floor.x - this.player.radius && 
                          this.player.x <= floor.x + floor.width + this.player.radius;

        return isInXRange;
    },

    
    checkWallCollisions() {
        const previousX = this.player.x - this.player.velocityX;

        const leftWallX = GameConfig.WALL_LEFT_X + GameConfig.WALL_THICKNESS + this.player.radius;
        const rightWallX = GameConfig.WALL_RIGHT_X - GameConfig.WALL_THICKNESS - this.player.radius;

        
        const wallBounceFactor = this.currentBallConfig.WALL_BOUNCE_FACTOR;
        const minBounceVelocity = this.currentBallConfig.MIN_BOUNCE_VELOCITY;
        const wallBoostEnabled = this.currentBallConfig.WALL_BOOST_ENABLED;
        const wallBoostMinVelocity = this.currentBallConfig.WALL_BOOST_MIN_VELOCITY;

        
        if (this.player.x < leftWallX) {
            if (GameConfig.CCD_ENABLED && Math.abs(this.player.velocityX) > GameConfig.CCD_MIN_VELOCITY_FOR_STEPS) {
                const steps = GameConfig.CCD_MAX_STEPS;
                for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    const stepX = previousX + (this.player.x - previousX) * t;

                    if (stepX < leftWallX) {
                        this.player.x = leftWallX;

                        if (Math.abs(this.player.velocityX) > minBounceVelocity) {
                            this.player.velocityX = Math.abs(this.player.velocityX) * wallBounceFactor;

                            if (Math.abs(this.player.velocityX) >= wallBoostMinVelocity && wallBoostEnabled) {
                                this.wallBoostDirection = 'left';
                            }
                        } else {
                            this.player.velocityX = 0;
                        }
                        break;
                    }
                }
            } else {
                this.player.x = leftWallX;

                if (Math.abs(this.player.velocityX) > minBounceVelocity) {
                    this.player.velocityX = Math.abs(this.player.velocityX) * wallBounceFactor;

                    if (Math.abs(this.player.velocityX) >= wallBoostMinVelocity && wallBoostEnabled) {
                        this.wallBoostDirection = 'left';
                    }
                } else {
                    this.player.velocityX = 0;
                }
            }
        }

        
        if (this.player.x > rightWallX) {
            if (GameConfig.CCD_ENABLED && Math.abs(this.player.velocityX) > GameConfig.CCD_MIN_VELOCITY_FOR_STEPS) {
                const steps = GameConfig.CCD_MAX_STEPS;
                for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    const stepX = previousX + (this.player.x - previousX) * t;

                    if (stepX > rightWallX) {
                        this.player.x = rightWallX;

                        if (Math.abs(this.player.velocityX) > minBounceVelocity) {
                            this.player.velocityX = -Math.abs(this.player.velocityX) * wallBounceFactor;

                            if (Math.abs(this.player.velocityX) >= wallBoostMinVelocity && wallBoostEnabled) {
                                this.wallBoostDirection = 'right';
                            }
                        } else {
                            this.player.velocityX = 0;
                        }
                        break;
                    }
                }
            } else {
                this.player.x = rightWallX;

                if (Math.abs(this.player.velocityX) > minBounceVelocity) {
                    this.player.velocityX = -Math.abs(this.player.velocityX) * wallBounceFactor;

                    if (Math.abs(this.player.velocityX) >= wallBoostMinVelocity && wallBoostEnabled) {
                        this.wallBoostDirection = 'right';
                    }
                } else {
                    this.player.velocityX = 0;
                }
            }
        }
    },
    
    
    checkCannonCollisions() {
        
        if (this.player.velocityY <= 0) return;
        
        const previousY = this.player.y - this.player.velocityY;
        const previousBottom = previousY + this.player.radius;
        const currentBottom = this.player.y + this.player.radius;
        
        for (const floor of this.floors) {
            if (!floor.hasCannon) continue;
            if (floor.fadeAlpha <= 0) continue;
            
            let cannonX, cannonWidth;
            const cannonY = floor.y;
            
            if (floor.cannonSide === 'right') {
                cannonX = GameConfig.WALL_RIGHT_X - GameConfig.WALL_THICKNESS - GameConfig.CANNON_HORIZONTAL_LENGTH;
                cannonWidth = GameConfig.CANNON_HORIZONTAL_LENGTH;
            } else {
                cannonX = GameConfig.WALL_LEFT_X + GameConfig.WALL_THICKNESS;
                cannonWidth = GameConfig.CANNON_HORIZONTAL_LENGTH;
            }
            
            
            const canUseCannonForBoost = this.currentBallConfig.CAN_USE_CANNON !== false;
            
            
            let collisionY;
            if (canUseCannonForBoost) {
                
                collisionY = cannonY;
            } else {
                
                collisionY = cannonY - GameConfig.CANNON_VERTICAL_LENGTH;
            }
            
            
            const leftBound = cannonX - this.player.radius;
            const rightBound = cannonX + cannonWidth + this.player.radius;
            
            if (this.player.x < leftBound || this.player.x > rightBound) {
                continue;
            }
            
            
            if (previousBottom <= collisionY && currentBottom >= collisionY) {
                
                this.player.y = collisionY - this.player.radius;
                
                if (canUseCannonForBoost) {
                    
                    this.player.velocityY = this.currentBallConfig.CANNON_BOOST_FORCE || GameConfig.CANNON_BOOST_FORCE;
                    this.player.onGround = false;
                    
                    if (GameConfig.SHOW_BOOST_ACTIVATED) {
                        this.boostActivated = true;
                        this.boostActivatedFrames = GameConfig.BOOST_ACTIVATED_DURATION * 3;
                    }
                } else {
                    
                    this.player.velocityY = 0;
                    this.player.onGround = true;
                }
                
                return;
            }
        }
    },

    
    checkLineIntersection(lineX1, lineX2, lineY) {
        const previousY = this.player.y - this.player.velocityY;
        const previousBottom = previousY + this.player.radius;
        const currentBottom = this.player.y + this.player.radius;

        
        if ((previousBottom <= lineY && currentBottom >= lineY) ||
            (previousBottom >= lineY && currentBottom <= lineY)) {
            
            
            const t = (lineY - previousBottom) / (currentBottom - previousBottom);
            
            
            const previousX = this.player.x - this.player.velocityX;
            const intersectX = previousX + (this.player.x - previousX) * t;
            
            
            
            const leftBound = lineX1 - this.player.radius;
            const rightBound = lineX2 + this.player.radius;
            
            return intersectX >= leftBound && intersectX <= rightBound;
        }

        return false;
    },
    
    
    checkCollisionWithCCD(startX, startY, endX, endY, radius, floorRect) {
        if (!GameConfig.CCD_ENABLED) {
            return { collision: this.circleRectCollision(endX, endY + radius, radius, 
                        floorRect.x, floorRect.y, floorRect.width, floorRect.height) };
        }
        
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < GameConfig.CCD_MIN_VELOCITY_FOR_STEPS) {
            return { collision: this.circleRectCollision(endX, endY + radius, radius, 
                        floorRect.x, floorRect.y, floorRect.width, floorRect.height) };
        }
        
        const steps = Math.min(GameConfig.CCD_MAX_STEPS, Math.ceil(distance / 5));
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const stepX = startX + dx * t;
            const stepY = startY + dy * t;
            
            const checkY = stepY + radius;
            
            if (this.circleRectCollision(stepX, checkY, radius, 
                    floorRect.x, floorRect.y, floorRect.width, floorRect.height)) {
                return { collision: true, x: stepX, y: stepY, t: t };
            }
        }
        
        return { collision: false };
    },
    
    
    circleRectCollision(circleX, circleY, radius, rectX, rectY, rectWidth, rectHeight) {
        const closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
        const closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight));
        
        const distanceX = circleX - closestX;
        const distanceY = circleY - closestY;
        
        return (distanceX * distanceX + distanceY * distanceY) <= (radius * radius);
    },
    
    
    checkWallBoost() {
        if (!this.currentBallConfig.WALL_BOOST_ENABLED) return;
        
        const wallBoostMaxDistance = this.currentBallConfig.WALL_BOOST_MAX_DISTANCE;
        const leftWallX = GameConfig.WALL_LEFT_X + GameConfig.WALL_THICKNESS;
        const rightWallX = GameConfig.WALL_RIGHT_X - GameConfig.WALL_THICKNESS;
        const distanceToLeftWall = Math.abs((this.player.x - this.player.radius) - leftWallX);
        const distanceToRightWall = Math.abs((this.player.x + this.player.radius) - rightWallX);
        
        if (distanceToLeftWall < wallBoostMaxDistance && this.wallBoostDirection === 'left') {
            this.wallBoostDistance = distanceToLeftWall;
            this.canWallBoost = true;
        } else if (distanceToRightWall < wallBoostMaxDistance && this.wallBoostDirection === 'right') {
            this.wallBoostDistance = distanceToRightWall;
            this.canWallBoost = true;
        } else {
            this.canWallBoost = false;
            this.wallBoostDistance = 0;
        }
    },
    
    
    activateWallBoost() {
        if (!this.canWallBoost || !this.wallBoostDirection) return;
        
        
        if (this.mobileControlsEnabled) {
            this.performWallBoost();
        } 
        
        else if ((this.wallBoostDirection === 'left' && this.keysPressedThisFrame['d']) || 
                 (this.wallBoostDirection === 'right' && this.keysPressedThisFrame['a'])) {
            this.performWallBoost();
        }
    },
    
    
    performWallBoost() {
        const wallBoostVelocityX = this.currentBallConfig.WALL_BOOST_VELOCITY_X;
        const wallBoostVelocityY = this.currentBallConfig.WALL_BOOST_VELOCITY_Y;
        
        if (this.wallBoostDirection === 'left') {
            this.player.velocityX = wallBoostVelocityX;
        } else {
            this.player.velocityX = -wallBoostVelocityX;
        }
        
        this.player.velocityY += wallBoostVelocityY;
        
        if (GameConfig.SHOW_BOOST_ACTIVATED) {
            this.boostActivated = true;
            this.boostActivatedFrames = GameConfig.BOOST_ACTIVATED_DURATION;
        }
        
        this.canWallBoost = false;
        this.wallBoostDirection = null;
        this.wallBoostDistance = 0;
    },
    
    
    
    
    updateSpecialFloors() {
        for (let i = this.floors.length - 1; i >= 0; i--) {
            const floor = this.floors[i];
            
            if (floor.shouldRemove) {
                
                this.coins = this.coins.filter(coin => coin.floorNumber !== floor.number);
                this.floors.splice(i, 1);
                continue;
            }
            
            switch(floor.type) {
                case 'moving':
                    const currentMovingSpeed = GameConfig.MOVING_FLOOR_SPEED * this.movingSpeedMultiplier;
                    const currentMovingRange = GameConfig.MOVING_FLOOR_RANGE * this.movingRangeMultiplier;
                    
                    floor.x += currentMovingSpeed * floor.movingDirection;
                    
                    const maxX = GameConfig.MOVING_FLOOR_MAX_X - floor.width;
                    const minX = GameConfig.MOVING_FLOOR_MIN_X;
                    
                    if (floor.x > floor.originalX + currentMovingRange) {
                        floor.x = floor.originalX + currentMovingRange;
                        floor.movingDirection = -1;
                    } else if (floor.x < floor.originalX - currentMovingRange) {
                        floor.x = floor.originalX - currentMovingRange;
                        floor.movingDirection = 1;
                    }
                    
                    if (floor.x > maxX) {
                        floor.x = maxX;
                        floor.movingDirection = -1;
                    } else if (floor.x < minX) {
                        floor.x = minX;
                        floor.movingDirection = 1;
                    }
                    break;
                    
                case 'shrinking':
                    if (floor.shrinkDelay > 0) {
                        floor.shrinkDelay--;
                    } else {
                        const currentShrinkSpeed = GameConfig.SHRINKING_FLOOR_SHRINK_SPEED * this.shrinkingSpeedMultiplier;
                        const minWidth = Math.max(20, GameConfig.SHRINKING_FLOOR_MIN_WIDTH * this.shrinkingMinWidthMultiplier);
                        
                        if (floor.width > minWidth) {
                            const newWidth = floor.width - currentShrinkSpeed;
                            const widthDiff = floor.width - Math.max(newWidth, minWidth);
                            
                            floor.width = Math.max(newWidth, minWidth);
                            floor.x = floor.shrinkingOriginalX + (floor.originalWidth - floor.width) / 2;
                        }
                    }
                    break;
                    
                case 'breaking':
                    if (floor.isBreaking && !floor.isFading) {
                        const currentBreakingSpeed = GameConfig.BREAKING_FLOOR_FADE_SPEED * this.breakingFadeSpeedMultiplier;
                        floor.fadeAlpha -= currentBreakingSpeed;
                        
                        if (floor.fadeAlpha <= 0) {
                            floor.shouldRemove = true;
                        }
                    }
                    break;
            }
        }
    },
    
    
    updateFadingFloors() {
        if (!this.fadeProcessActive) return;
        
        this.floorFadeTimer++;
        
        let fadeSpeedMultiplier = 1.0;
        if (this.difficultyActive) {
            fadeSpeedMultiplier = Math.min(
                GameConfig.DIFFICULTY_FLOOR_FADE_MULTIPLIER * this.currentDifficulty, 
                GameConfig.DIFFICULTY_MAX_FADE_MULTIPLIER
            );
        }
        
        if (this.floorFadeTimer >= GameConfig.FLOOR_FADE_INITIAL_DELAY) {
            const floorsSinceStart = Math.floor((this.floorFadeTimer - GameConfig.FLOOR_FADE_INITIAL_DELAY) / GameConfig.FLOOR_FADE_TIME_BETWEEN_FLOORS);
            const targetFloorsToFade = Math.min(floorsSinceStart, GameConfig.FLOOR_FADE_MAX_FLOORS_AT_ONCE);
            
            for (let i = this.nextFloorToFade; i < targetFloorsToFade; i++) {
                const floor = this.floors.find(f => f.number === i);
                if (floor && !floor.isFading) {
                    floor.isFading = true;
                    this.nextFloorToFade = i + 1;
                    
                    if (floor.type === 'breaking' && floor.isBreaking) {
                        floor.isBreaking = false;
                    }
                }
            }
        }
        
        for (let i = this.floors.length - 1; i >= 0; i--) {
            const floor = this.floors[i];
            
            if (floor.isFading) {
                const actualFadeSpeed = GameConfig.FLOOR_FADE_ALPHA_SPEED * fadeSpeedMultiplier;
                if (floor.fadeAlpha > GameConfig.FLOOR_FADE_MIN_ALPHA) {
                    floor.fadeAlpha -= actualFadeSpeed;
                }
                
                if (floor.fadeAlpha <= GameConfig.FLOOR_FADE_MIN_ALPHA) {
                    
                    this.coins = this.coins.filter(coin => coin.floorNumber !== floor.number);
                    this.floors.splice(i, 1);
                }
            }
        }
    },
    
    
    updateDifficulty() {
        if (!GameConfig.DIFFICULTY_ENABLED) return;
        
        if (this.maxFloorReached >= GameConfig.DIFFICULTY_START_AT_SCORE && !this.difficultyActive) {
            this.difficultyActive = true;
        }
        
        if (this.difficultyActive) {
            this.currentDifficulty = 1.0 + (this.maxFloorReached - GameConfig.DIFFICULTY_START_AT_SCORE) * 0.01;
            
            this.movingSpeedMultiplier = this.calculateDifficultyMultiplier(GameConfig.DIFFICULTY_MOVING_SPEED_MULTIPLIER);
            this.movingRangeMultiplier = this.calculateDifficultyMultiplier(GameConfig.DIFFICULTY_MOVING_RANGE_MULTIPLIER);
            this.shrinkingMinWidthMultiplier = this.calculateDifficultyMultiplier(GameConfig.DIFFICULTY_SHRINKING_MIN_WIDTH_MULTIPLIER);
            this.shrinkingSpeedMultiplier = this.calculateDifficultyMultiplier(GameConfig.DIFFICULTY_SHRINKING_SPEED_MULTIPLIER);
            this.shrinkingDelayMultiplier = this.calculateDifficultyMultiplier(GameConfig.DIFFICULTY_SHRINKING_DELAY_MULTIPLIER);
            this.breakingFadeSpeedMultiplier = this.calculateDifficultyMultiplier(GameConfig.DIFFICULTY_BREAKING_FADE_SPEED_MULTIPLIER);
        }
    },
    
    
    calculateDifficultyMultiplier(baseMultiplier) {
        return 1 + (this.currentDifficulty - 1) * (baseMultiplier - 1);
    },
    
    
    startFloorFadeProcess() {
        if (this.fadeProcessActive) return;
        
        this.fadeProcessActive = true;
        this.floorFadeTimer = 0;
        this.nextFloorToFade = 0;
    },
    
    
    updateBoostEffect() {
        if (this.boostActivated && this.boostActivatedFrames > 0) {
            this.boostActivatedFrames--;
        } else {
            this.boostActivated = false;
            this.boostActivatedFrames = 0;
        }
    },
    
    
    updateMagnet() {
        
        this.magnetActive = this.currentBallConfig.MAGNET_ENABLED;
        this.magnetRange = this.currentBallConfig.MAGNET_RANGE;
    },
    
    
    updateCamera() {
        const playerScreenY = this.player.y;
        
        if (playerScreenY < GameConfig.CAMERA_THRESHOLD) {
            this.cameraY = GameConfig.CAMERA_THRESHOLD - playerScreenY;
        } else {
            this.cameraY = 0;
        }
    },
    
    
    updateHeight() {
        this.currentHeight = Math.max(0, Math.round(this.startFloorLevel - this.player.y));
        
        if (this.currentHeight > this.maxJumpHeight) {
            this.maxJumpHeight = this.currentHeight;
        }
        
        
        if (this.state.settings.debugInfo) {
            const heightEl = document.getElementById('height');
            const maxHeightEl = document.getElementById('max-height');
            if (heightEl) heightEl.textContent = this.currentHeight;
            if (maxHeightEl) maxHeightEl.textContent = this.maxJumpHeight;
        }
    },
    
    
    updateVelocityDisplay() {
        this.currentVelocityX = Math.abs(this.player.velocityX);
        this.currentVelocityY = Math.abs(this.player.velocityY);
        
        if (this.currentVelocityX > this.maxVelocityX) {
            this.maxVelocityX = this.currentVelocityX;
        }
        if (this.currentVelocityY > this.maxVelocityY) {
            this.maxVelocityY = this.currentVelocityY;
        }
        
        
        if (this.state.settings.debugInfo) {
            const velocityXEl = document.getElementById('velocity-x');
            const maxVelocityXEl = document.getElementById('max-velocity-x');
            const velocityYEl = document.getElementById('velocity-y');
            const maxVelocityYEl = document.getElementById('max-velocity-y');
            
            if (velocityXEl) velocityXEl.textContent = this.currentVelocityX.toFixed(2);
            if (maxVelocityXEl) maxVelocityXEl.textContent = this.maxVelocityX.toFixed(2);
            if (velocityYEl) velocityYEl.textContent = this.currentVelocityY.toFixed(2);
            if (maxVelocityYEl) maxVelocityYEl.textContent = this.maxVelocityY.toFixed(2);
        }
    },
    
    
updateFloorDisplay() {
    let currentFloor = 0;
    let foundFloor = false;
    
    for (const floor of this.floors) {
        if (this.player.onGround && 
            this.player.y + this.player.radius >= floor.y &&
            this.player.y + this.player.radius <= floor.y + floor.height &&
            this.player.x >= floor.x &&
            this.player.x <= floor.x + floor.width) {
            currentFloor = floor.number;
            foundFloor = true;
            this.currentFloorIndex = currentFloor;
            break;
        }
    }
    
    if (!foundFloor) {
        currentFloor = Math.max(0, Math.floor((GameConfig.CANVAS_HEIGHT - 50 - this.player.y) / GameConfig.FLOOR_VERTICAL_SPACING));
    }
    
    if (this.player.onGround && currentFloor > this.maxFloorReached) {
        this.maxFloorReached = currentFloor;
        
        if (this.maxFloorReached >= GameConfig.FLOOR_FADE_START_AT_SCORE && !this.fadeProcessActive) {
            this.startFloorFadeProcess();
        }
        
        if (this.maxFloorReached > this.highestFloorEver) {
            this.highestFloorEver = this.maxFloorReached;
            this.saveHighScore(); 
            
            
            if (window.Menu) {
                window.Menu.state.bestScore = this.highestFloorEver;
                window.Menu.updateMainMenu();
            }
        }
    }
    
    
    if (this.state.settings.debugInfo) {
        const currentFloorEl = document.getElementById('current-floor');
        const maxFloorEl = document.getElementById('max-floor');
        const highScoreEl = document.getElementById('high-score');
        
        if (currentFloorEl) currentFloorEl.textContent = currentFloor;
        if (maxFloorEl) maxFloorEl.textContent = this.maxFloorReached;
        if (highScoreEl) highScoreEl.textContent = this.highestFloorEver;
    }
    
    
    if (window.Menu) {
        window.Menu.state.scoreInGame = this.maxFloorReached;
        window.Menu.updateGameHUD();
    }
},
    
    
    checkIfAnyFloorsLeft() {
        let lowestFloorY = -Infinity;
        
        for (const floor of this.floors) {
            if ((floor.isFading || (floor.type === 'breaking' && floor.isBreaking)) && 
                floor.fadeAlpha < GameConfig.FADING_FLOOR_MIN_ALPHA_FOR_COLLISION) continue;
            
            if (floor.fadeAlpha <= 0) continue;
                
            if (floor.y > lowestFloorY) {
                lowestFloorY = floor.y;
            }
        }
        
        if (lowestFloorY === -Infinity) {
            return false;
        }
        
        if (this.player.y > lowestFloorY + GameConfig.GAME_OVER_FALL_THRESHOLD) {
            return false;
        }
        
        return true;
    },
    
    
    checkGameOver() {
        if (!GameConfig.GAME_OVER_ENABLED) return;

        if (!this.checkIfAnyFloorsLeft() && this.player.velocityY > 0) {
            this.gameOver = true;
            this.isGameOver = true;

            
            if (this.maxFloorReached > this.highestFloorEver) {
                this.highestFloorEver = this.maxFloorReached;
                this.saveHighScore();
            }

            
            if (window.Menu) {
                window.Menu.gameOver();
            }
        }
    },
    
    
    
    update() {
        if (this.isPaused || this.isGameOver || !this.gameStarted) return;
        
        this.updateInput();
        
        
        this.updateWind();
        
        
        this.player.velocityY += this.currentBallConfig.GRAVITY;
        
        const previousX = this.player.x;
        const previousY = this.player.y;
        
        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;
        
        this.checkWallCollisions();
        this.checkCannonCollisions();
        this.checkFloorCollisions();
        this.checkCoinCollisions();
        
        this.checkWallBoost();
        this.activateWallBoost();
        this.updateBoostEffect();
        this.updateCoinEffects();
        this.updateMagnet();
        
        this.generateMoreFloorsIfNeeded();
        this.updateDifficulty();
        this.updateSpecialFloors();
        this.updateFadingFloors();
        this.updateCamera();
        this.updateHeight();
        this.updateVelocityDisplay();
        this.updateFloorDisplay();
        
        this.checkGameOver();
    },
    
    render() {
        
        this.ctx.fillStyle = GameConfig.CANVAS_BACKGROUND_COLOR;
        this.ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);
        
        this.ctx.save();
        this.ctx.translate(0, this.cameraY);
        
        
        this.ctx.fillStyle = GameConfig.WALL_COLOR;
        this.ctx.fillRect(0, -100000, GameConfig.WALL_THICKNESS, GameConfig.CANVAS_HEIGHT + 200000);
        this.ctx.fillRect(GameConfig.CANVAS_WIDTH - GameConfig.WALL_THICKNESS, -100000, GameConfig.WALL_THICKNESS, GameConfig.CANVAS_HEIGHT + 200000);
        
        
        for (const floor of this.floors) {
            if (floor.fadeAlpha <= GameConfig.FLOOR_FADE_MIN_ALPHA) continue;
            
            this.ctx.globalAlpha = floor.fadeAlpha;
            this.ctx.fillStyle = floor.color;
            this.ctx.fillRect(floor.x, floor.y, floor.width, floor.height);
            
            if (floor.isSpecial && floor.fadeAlpha > 0.5) {
                this.ctx.strokeStyle = "#fff";
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(floor.x, floor.y, floor.width, floor.height);
                
                this.ctx.fillStyle = "#fff";
                this.ctx.font = "14px monospace";
                this.ctx.textAlign = "center";
                this.ctx.fillText(`Floor ${floor.number}`, floor.x + floor.width / 2, floor.y+12);
                this.ctx.textAlign = "left";
            }
            
            if (floor.type !== 'normal' && floor.type !== 'special' && floor.fadeAlpha > 0.5) {
                this.ctx.fillStyle = "#fff";
                this.ctx.font = "12px monospace";
                this.ctx.textAlign = "center";
                
                let typeText = "";
                switch(floor.type) {
                    case 'moving': typeText = ""; break;
                    case 'shrinking': typeText = ""; break;
                    case 'breaking': typeText = ""; break;
                }
                
                this.ctx.fillText(typeText, floor.x + floor.width / 2, floor.y + 18);
                this.ctx.textAlign = "left";
            }
            
            if (floor.isFading && floor.fadeAlpha > GameConfig.FADING_FLOOR_MIN_ALPHA_FOR_COLLISION) {
                this.ctx.strokeStyle = "#ff6666";
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 5]);
                this.ctx.strokeRect(floor.x, floor.y, floor.width, floor.height);
                this.ctx.setLineDash([]);
            }
            
            this.ctx.globalAlpha = 1.0;
        }
        
        
        for (const floor of this.floors) {
            if (floor.fadeAlpha > GameConfig.FLOOR_FADE_MIN_ALPHA) {
                this.renderCannon(floor);
            }
        }
        
        
        this.renderCoins();
        
        
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.currentBallConfig.COLOR;
        this.ctx.fill();
        this.ctx.closePath();
        
        
        if (this.state.settings.debugInfo && GameConfig.SHOW_BOOST_HINT && this.canWallBoost) {
            this.ctx.beginPath();
            this.ctx.arc(this.player.x, this.player.y, this.player.radius + 5, 0, Math.PI * 2);
            this.ctx.strokeStyle = GameConfig.BOOST_HINT_COLOR;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.closePath();
        }
        
        
        if (GameConfig.SHOW_BOOST_ACTIVATED && this.boostActivated) {
            const effectRadius = this.player.radius + 5; 
            this.ctx.beginPath();
            this.ctx.arc(this.player.x, this.player.y, effectRadius, 0, Math.PI * 2);
            this.ctx.strokeStyle = GameConfig.BOOST_ACTIVATED_COLOR;
            this.ctx.lineWidth = Math.max(2, this.player.radius * 0.1); 
            this.ctx.stroke();
            this.ctx.closePath();
        }
        
        this.ctx.restore();
        
        
        this.renderCoinEffects();
        
        
        if (this.state.settings.windDisplay) {
            this.renderWindArrow();
        }
        
        
        if (this.state.settings.debugInfo) {
            this.renderCoinCounter();
        }
        
        
        if (this.state.settings.debugInfo) {
            
            if (this.mobileControlsEnabled) {
                this.ctx.fillStyle = '#4aff9a';
                this.ctx.font = '14px monospace';
                this.ctx.fillText('MOBILE CONTROLS: ON', 20, GameConfig.CANVAS_HEIGHT - 40);
            }
            
            
            if (this.autoJumpActive) {
                this.ctx.fillStyle = '#4aff9a';
                this.ctx.font = '14px monospace';
                this.ctx.fillText('AUTO JUMP: ON', 20, GameConfig.CANVAS_HEIGHT - 20);
            }
            
            
            if (this.useAccelerometer) {
                this.ctx.fillStyle = '#4aff9a';
                this.ctx.font = '14px monospace';
                this.ctx.fillText('ACCELEROMETER: ON', 20, GameConfig.CANVAS_HEIGHT - 60);
            }
            
            
            if (GameConfig.SHOW_BOOST_HINT && this.canWallBoost && this.wallBoostDirection) {
                this.ctx.fillStyle = GameConfig.BOOST_HINT_COLOR;
                this.ctx.font = "14px monospace";
                this.ctx.fillText(`BOOST! Press ${this.wallBoostDirection === 'left' ? 'D' : 'A'}`, 20, GameConfig.CANVAS_HEIGHT - 80);
            }
            
            
            if (this.fadeProcessActive) {
                this.ctx.fillStyle = "#ff6666";
                this.ctx.font = "16px monospace";
                this.ctx.fillText(`FLOORS FADING!`, GameConfig.CANVAS_WIDTH - 200, GameConfig.CANVAS_HEIGHT - 30);
            }
            
            
            this.ctx.fillStyle = '#aaaaaa';
            this.ctx.font = '12px monospace';
            this.ctx.fillText(`Scale: ${this.scaleFactor ? this.scaleFactor.toFixed(2) : '1.00'}`, 
                GameConfig.CANVAS_WIDTH - 100, GameConfig.CANVAS_HEIGHT - 10);
        }
    },
    
    
    renderCannon(floor) {
        if (!floor.hasCannon) return;
        
        this.ctx.globalAlpha = floor.fadeAlpha;
        
        let cannonX, cannonHorizontalY, cannonVerticalX, cannonVerticalY;
        const cannonY = floor.y;
        
        if (floor.cannonSide === 'right') {
            cannonX = GameConfig.WALL_RIGHT_X - GameConfig.WALL_THICKNESS - GameConfig.CANNON_HORIZONTAL_LENGTH;
            cannonHorizontalY = cannonY;
            cannonVerticalX = cannonX;
            cannonVerticalY = cannonY - GameConfig.CANNON_VERTICAL_LENGTH;
        } else {
            cannonX = GameConfig.WALL_LEFT_X + GameConfig.WALL_THICKNESS;
            cannonHorizontalY = cannonY;
            cannonVerticalX = cannonX + GameConfig.CANNON_HORIZONTAL_LENGTH - GameConfig.CANNON_THICKNESS;
            cannonVerticalY = cannonY - GameConfig.CANNON_VERTICAL_LENGTH;
        }
        
        this.ctx.fillStyle = GameConfig.CANNON_COLOR;
        this.ctx.fillRect(cannonX, cannonHorizontalY, GameConfig.CANNON_HORIZONTAL_LENGTH, GameConfig.CANNON_THICKNESS);
        this.ctx.fillRect(cannonVerticalX, cannonVerticalY, GameConfig.CANNON_THICKNESS, GameConfig.CANNON_VERTICAL_LENGTH);
        
        this.ctx.globalAlpha = 1.0;
    },
    
    
    renderCoins() {
        if (!GameConfig.COINS_ENABLED) return;
        
        for (const coin of this.coins) {
            if (coin.collected) continue;
            
            
            if (GameConfig.COIN_GLOW_SIZE > 0) {
                this.ctx.beginPath();
                this.ctx.arc(coin.x, coin.y, coin.radius + GameConfig.COIN_GLOW_SIZE, 0, Math.PI * 2);
                this.ctx.fillStyle = GameConfig.COIN_GLOW_COLOR;
                this.ctx.fill();
            }
            
            
            this.ctx.beginPath();
            this.ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = GameConfig.COIN_OUTLINE_COLOR;
            this.ctx.fill();
            
            
            this.ctx.beginPath();
            this.ctx.arc(coin.x, coin.y, coin.radius - GameConfig.COIN_OUTLINE_WIDTH, 0, Math.PI * 2);
            this.ctx.fillStyle = GameConfig.COIN_COLOR;
            this.ctx.fill();
            
            
            this.ctx.beginPath();
            this.ctx.moveTo(coin.x, coin.y - coin.radius * 0.3);
            this.ctx.lineTo(coin.x + coin.radius * 0.5, coin.y - coin.radius * 0.5);
            this.ctx.lineTo(coin.x + coin.radius * 0.3, coin.y);
            this.ctx.closePath();
            this.ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            this.ctx.fill();
        }
    },
    

renderCoinEffects() {
    if (!GameConfig.COIN_COLLECT_EFFECT_ENABLED) return;
    
    
    this.ctx.save();
    
    
    this.ctx.translate(0, this.cameraY);
    
    for (const effect of this.coinEffects) {
        const progress = 1 - (effect.duration / effect.maxDuration);
        const currentRadius = effect.radius * (1 + progress * (GameConfig.COIN_COLLECT_EFFECT_SIZE_MULTIPLIER - 1));
        const alpha = 1 - progress;
        
        
        const color = this.getCoinEffectColor(progress);
        
        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, currentRadius, 0, Math.PI * 2);
        
        
        this.ctx.fillStyle = `rgba(${color}, ${alpha * 0.3})`; 
        this.ctx.fill();
        
        this.ctx.strokeStyle = `rgba(${color}, ${alpha})`;
        this.ctx.lineWidth = Math.max(2, effect.radius * 0.15); 
        this.ctx.stroke();
        
        
        if (progress < 0.5) {
            this.drawSparkleEffect(effect.x, effect.y, currentRadius, alpha);
        }
    }
    
    
    this.ctx.restore();
},


getCoinEffectColor(progress) {
    
    if (progress < 0.3) {
        return "255, 255, 0"; 
    } else if (progress < 0.6) {
        return "255, 200, 0"; 
    } else {
        return "255, 150, 0"; 
    }
},

    
    drawSparkleEffect(x, y, radius, alpha) {
        const sparkleCount = 8;
        const sparkleLength = radius * 0.8;
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha * 0.7;
        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < sparkleCount; i++) {
            const angle = (i / sparkleCount) * Math.PI * 2;
            const startX = x + Math.cos(angle) * radius * 0.3;
            const startY = y + Math.sin(angle) * radius * 0.3;
            const endX = x + Math.cos(angle) * sparkleLength;
            const endY = y + Math.sin(angle) * sparkleLength;
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    },
    
    gameLoop() {
        if (!this.gameLoopRunning) return;
        
        this.update();
        this.render();
        
        setTimeout(() => {
            requestAnimationFrame(this.gameLoop.bind(this));
        }, 1000 / GameConfig.FPS);
    },
    
    
    
    
    loadHighScore() {
        
        const savedData = localStorage.getItem('icy_tower_game_data');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.highestFloorEver = data.bestScore || 0;
                console.log('Wczytano rekord z gry:', this.highestFloorEver);
            } catch (e) {
                console.error('Błąd ładowania rekordu:', e);
                this.highestFloorEver = 0;
            }
        }

        
        if (this.state.settings.debugInfo) {
            const highScoreEl = document.getElementById('high-score');
            if (highScoreEl) highScoreEl.textContent = this.highestFloorEver;
        }
    },

    saveHighScore() {
        
        if (this.highestFloorEver > (this.state.bestScore || 0)) {
            
            const savedData = localStorage.getItem('icy_tower_game_data');
            let data = {};

            if (savedData) {
                try {
                    data = JSON.parse(savedData);
                } catch (e) {
                    console.error('Błąd parsowania danych:', e);
                }
            }

            
            data.bestScore = this.highestFloorEver;

            
            localStorage.setItem('icy_tower_game_data', JSON.stringify(data));

            
            if (window.Menu) {
                window.Menu.state.bestScore = this.highestFloorEver;
                window.Menu.saveData();
            }

            console.log('Zapisano nowy rekord:', this.highestFloorEver);
        }
    },
    
    
    loadTotalCoins() {
        if (!GameConfig.COINS_ENABLED) return;
        
        const savedCoins = localStorage.getItem(GameConfig.SAVE_COINS_KEY);
        if (savedCoins) {
            this.totalCoins = parseInt(savedCoins, 10);
            if (isNaN(this.totalCoins)) this.totalCoins = 0;
        }
    },
    
    
    saveTotalCoins() {
        if (!GameConfig.COINS_ENABLED) return;

        
        if (window.Menu) {
            
            window.Menu.state.coinsInGame = this.collectedCoins;
        }
    },
    
    
    
    
    updateGameHUD() {
        
        
    },
    
    stopGame() {
        this.gameLoopRunning = false;
        this.gameStarted = false;
        this.isPaused = false;
        this.isGameOver = false;
    },

    
    getLineIntersection(p0, p1, p2, p3) {
        const s1_x = p1.x - p0.x;
        const s1_y = p1.y - p0.y;
        const s2_x = p3.x - p2.x;
        const s2_y = p3.y - p2.y;

        const s = (-s1_y * (p0.x - p2.x) + s1_x * (p0.y - p2.y)) / (-s2_x * s1_y + s1_x * s2_y);
        const t = ( s2_x * (p0.y - p2.y) - s2_y * (p0.x - p2.x)) / (-s2_x * s1_y + s1_x * s2_y);

        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            return {
                x: p0.x + (t * s1_x),
                y: p0.y + (t * s1_y)
            };
        }

        return null;
    }

};


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.Game) {
            Game.init();
        }
    });
} else {
    if (window.Game) {
        Game.init();
    }
}

console.log('Game.js loaded successfully - Responsive version');
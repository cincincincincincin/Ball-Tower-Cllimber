

const Menu = {
    
    state: {
        currentScreen: 'start',
        totalCoins: 0,
        bestScore: 0, 
        unlockedBalls: ['standard'],
        currentBall: 'standard',
        gameStarted: false,
        isPaused: false,
        isGameOver: false,
        coinsInGame: 0,
        scoreInGame: 0, 
        isMobile: false,
        settings: {
            autoJump: true,               
            mobileControls: true,         
            accelerometer: true,          
            windDisplay: true,            
            debugInfo: false
        },
        upgrades: {
            standard: {},
            rubber: {},
            beach: {},
            golf: {}
        }
    },

    
    init() {
        console.log('Menu.init() - Menu initialization');

        this.setupEventListenersEarly();
        
        this.checkMobile();
        this.loadData();
        
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeAfterDOM();
            });
        } else {
            this.initializeAfterDOM();
        }
    },

    setupEventListenersEarly() {
        console.log('Setting up early event listeners for standalone mode');
        
        // Wczesna inicjalizacja dla przycisku play
        const playBtn = document.getElementById('play-btn');
        if (playBtn) {
            // Usuń stare event listeners
            const newPlayBtn = playBtn.cloneNode(true);
            playBtn.parentNode.replaceChild(newPlayBtn, playBtn);

            newPlayBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Play button clicked (early)');
                this.startGame();
                return false;
            });

            // Touch event dla standalone
            newPlayBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                newPlayBtn.click();
                return false;
            }, { passive: false });
        }

        // To samo dla innych głównych przycisków
        const buttonsToFix = ['balls-btn', 'upgrades-btn', 'settings-btn', 'pause-btn'];

        buttonsToFix.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);

                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    switch(btnId) {
                        case 'balls-btn':
                            this.switchScreen('balls');
                            break;
                        case 'upgrades-btn':
                            this.switchScreen('upgrades');
                            break;
                        case 'settings-btn':
                            this.switchScreen('settings');
                            break;
                        case 'pause-btn':
                            this.togglePause();
                            break;
                    }

                    return false;
                });

                newBtn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    newBtn.click();
                    return false;
                }, { passive: false });
            }
        });

        console.log('Early event listeners setup complete');
    },
    
    initializeAfterDOM() {
        this.setupEventListeners();
        this.updateUI();
        this.switchScreen('start');
        
        
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 100);
        });
        
        console.log('Menu initialized - Responsive mode');
    },

    
    checkMobile() {
        this.state.isMobile = window.innerWidth <= GameConfig.MOBILE_BREAKPOINT || 
                              /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (this.state.isMobile) {
            document.body.classList.add('mobile');
            this.setupViewport();
        }
    },
    
    
    setupViewport() {
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        
        
        viewport.setAttribute('content', 
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    },

    
    handleResize() {
        this.checkMobile();
        this.updateUI();
        
        
        if (window.Game && Game.resizeCanvas) {
            Game.resizeCanvas();
        }
        
        
        if (window.innerHeight > window.innerWidth) {
            
            document.body.classList.add('portrait');
            document.body.classList.remove('landscape');
        } else {
            
            document.body.classList.add('landscape');
            document.body.classList.remove('portrait');
        }
    },

    
    loadData() {
        console.log('Loading data...');
        
        
        const savedData = localStorage.getItem('icy_tower_game_data');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                this.state.totalCoins = data.totalCoins || 0;
                this.state.bestScore = data.bestScore || 0;
                this.state.unlockedBalls = data.unlockedBalls || ['standard'];
                this.state.currentBall = data.currentBall || 'standard';
                
                if (data.settings) {
                    this.state.settings = { ...this.state.settings, ...data.settings };
                }
                
                this.state.upgrades = data.upgrades || {
                    standard: {}, rubber: {}, beach: {}, golf: {}
                };
                
                console.log('Data loaded from icy_tower_game_data:', data);
            } catch (e) {
                console.error('Error loading data:', e);
                this.resetData();
            }
        } else {
            
            const oldData = localStorage.getItem('icyTowerData');
            if (oldData) {
                try {
                    const data = JSON.parse(oldData);
                    
                    this.state.totalCoins = data.totalCoins || 0;
                    this.state.bestScore = data.bestScore || 0;
                    this.state.unlockedBalls = data.unlockedBalls || ['standard'];
                    this.state.currentBall = data.currentBall || 'standard';
                    
                    if (data.settings) {
                        this.state.settings = { ...this.state.settings, ...data.settings };
                    }
                    
                    this.state.upgrades = data.upgrades || {
                        standard: {}, rubber: {}, beach: {}, golf: {}
                    };
                    
                    
                    this.saveData();
                    
                    localStorage.removeItem('icyTowerData');
                    
                    console.log('Data migrated from icyTowerData');
                } catch (e) {
                    console.error('Error migrating data:', e);
                    this.resetData();
                }
            } else {
                this.resetData();
            }
        }
        
        this.updateCoinsDisplay();
    },

    resetData() {
        this.state.totalCoins = 0;
        this.state.bestScore = 0;
        this.state.unlockedBalls = ['standard'];
        this.state.currentBall = 'standard';
        
        
        this.state.settings = {
            autoJump: true,
            mobileControls: true,
            accelerometer: true,
            windDisplay: true,
            debugInfo: false
        };
        
        this.state.upgrades = {
            standard: {}, rubber: {}, beach: {}, golf: {}
        };
        
        
        localStorage.removeItem('icy_tower_game_data');
        localStorage.removeItem('icyTowerData');
        localStorage.removeItem('icy_tower_high_score');
        localStorage.removeItem('icy_tower_total_coins');
        
        
        this.saveData();
        this.showNotification('All data has been reset', 'warning');
    },
    
    saveData() {
        const data = {
            totalCoins: this.state.totalCoins,
            bestScore: this.state.bestScore,
            unlockedBalls: this.state.unlockedBalls,
            currentBall: this.state.currentBall,
            settings: this.state.settings,
            upgrades: this.state.upgrades || {}
        };
        
        localStorage.setItem('icy_tower_game_data', JSON.stringify(data));
    },

    
    switchScreen(screenName) {
        console.log('Switching screen to:', screenName);
        
        
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        
        document.getElementById('pause-menu').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        
        
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.state.currentScreen = screenName;
            
            
            this.updateScreenUI(screenName);
        }
        
        
        if (screenName !== 'game') {
            this.state.isPaused = false;
            this.state.gameStarted = false;
            if (window.Game && Game.stopGame) {
                Game.stopGame();
            }
        }
        
        
        if (targetScreen) {
            targetScreen.scrollTop = 0;
        }
    },

    
    updateScreenUI(screenName) {
        switch(screenName) {
            case 'start':
                this.updateMainMenu();
                break;
            case 'balls':
                this.updateBallsScreen();
                break;
            case 'upgrades':
                this.updateUpgradesScreen();
                break;
            case 'settings':
                this.updateSettingsScreen();
                break;
        }
    },

    
    updateMainMenu() {
        
        document.getElementById('total-coins').textContent = this.state.totalCoins;
        document.getElementById('best-score').textContent = this.state.bestScore;
        document.getElementById('unlocked-balls').textContent = 
            `${this.state.unlockedBalls.length}/4`;
            
        
        if (document.body.classList.contains('landscape')) {
            const titleContainer = document.querySelector('.title-container');
            if (titleContainer) {
                titleContainer.style.marginBottom = '2vh';
            }
        }
    },

    
    updateBallsScreen() {
        
        document.getElementById('balls-coins').textContent = this.state.totalCoins;
        
        
        const balls = ['standard', 'rubber', 'beach', 'golf'];
        balls.forEach(ballType => {
            const ballCard = document.querySelector(`.ball-card[data-ball="${ballType}"]`);
            if (!ballCard) return;
            
            const isUnlocked = this.state.unlockedBalls.includes(ballType);
            const isCurrent = this.state.currentBall === ballType;
            
            
            ballCard.classList.toggle('locked', !isUnlocked);
            ballCard.classList.toggle('active', isCurrent);
            
            
            const lockIcon = ballCard.querySelector('.fa-lock');
            if (lockIcon) {
                lockIcon.style.display = isUnlocked ? 'none' : 'block';
            }
            
            
            const existingUnlockBtn = ballCard.querySelector('.unlock-btn');
            const existingSelectBtn = ballCard.querySelector('.select-ball-btn');
            if (existingUnlockBtn) existingUnlockBtn.remove();
            if (existingSelectBtn) existingSelectBtn.remove();
            
            
            if (isUnlocked) {
                const selectBtn = document.createElement('button');
                selectBtn.className = 'select-ball-btn';
                selectBtn.textContent = isCurrent ? 'Selected' : 'Select';
                selectBtn.onclick = () => {
                    this.selectBall(ballType);
                };
                ballCard.appendChild(selectBtn);
            } else {
                
                const unlockBtn = document.createElement('button');
                unlockBtn.className = 'unlock-btn';
                unlockBtn.dataset.cost = GameConfig.getBallUnlockPrice(ballType);
                unlockBtn.innerHTML = `Unlock for ${unlockBtn.dataset.cost} <i class="fas fa-coins"></i>`;
                unlockBtn.disabled = this.state.totalCoins < parseInt(unlockBtn.dataset.cost);
                unlockBtn.onclick = () => {
                    this.unlockBall(ballType);
                };
                ballCard.appendChild(unlockBtn);
            }
        });
        
        
        document.getElementById('current-ball-name').textContent = 
            GameConfig.getBallDisplayName(this.state.currentBall);
            
        
        if (document.body.classList.contains('landscape')) {
            const ballsContainer = document.querySelector('.balls-container');
            if (ballsContainer) {
                ballsContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
            }
        }
    },

    
    updateUpgradesScreen() {
        
        document.getElementById('upgrades-coins').textContent = this.state.totalCoins;
        
        
        const selector = document.querySelector('.ball-selector-buttons');
        if (selector) {
            selector.innerHTML = '';
            
            this.state.unlockedBalls.forEach(ballType => {
                const button = document.createElement('button');
                button.className = `ball-select-btn ${this.state.currentBall === ballType ? 'active' : ''}`;
                button.textContent = GameConfig.getBallDisplayName(ballType);
                button.onclick = () => {
                    this.state.currentBall = ballType;
                    this.updateUpgradesScreen();
                };
                selector.appendChild(button);
            });
        }
        
        
        const upgradesList = document.getElementById('upgrades-list');
        if (upgradesList) {
            upgradesList.innerHTML = '';
            
            const ballUpgrades = GameConfig.getUpgradeDefinitions(this.state.currentBall);
            const playerUpgrades = this.state.upgrades[this.state.currentBall] || {};
            
            ballUpgrades.forEach(upgradeDef => {
                const currentLevel = playerUpgrades[upgradeDef.id]?.level || 0;
                const isMaxLevel = currentLevel >= upgradeDef.maxLevel;
                const nextPrice = GameConfig.getUpgradePrice(upgradeDef.basePrice, currentLevel + 1);
                const canAfford = this.state.totalCoins >= nextPrice;
                const isActive = playerUpgrades[upgradeDef.id]?.active !== false;
                
                const upgradeEl = document.createElement('div');
                upgradeEl.className = 'upgrade-item';
                upgradeEl.innerHTML = `
                    <div class="upgrade-info">
                        <h4>${upgradeDef.name} (${currentLevel}/${upgradeDef.maxLevel})</h4>
                        <p>${upgradeDef.description}</p>
                        <div class="upgrade-level">
                            ${this.getUpgradeLevelBar(currentLevel, upgradeDef.maxLevel)}
                        </div>
                    </div>
                    <div class="upgrade-actions">
                        <div class="upgrade-price">
                            <i class="fas fa-coins"></i> ${nextPrice}
                        </div>
                        ${currentLevel > 0 ? `
                            <button class="toggle-btn ${isActive ? '' : 'off'}"
                                    onclick="Menu.toggleUpgrade('${this.state.currentBall}', '${upgradeDef.id}')">
                                ${isActive ? 'ON' : 'OFF'}
                            </button>
                        ` : ''}
                        <button class="buy-btn" 
                                ${isMaxLevel || !canAfford ? 'disabled' : ''}
                                onclick="Menu.buyUpgrade('${this.state.currentBall}', '${upgradeDef.id}')">
                            ${isMaxLevel ? 'MAX' : 'Buy'}
                        </button>
                    </div>
                `;
                
                upgradesList.appendChild(upgradeEl);
            });
        }
    },

    
    updateSettingsScreen() {
        
        document.getElementById('auto-jump-toggle').checked = this.state.settings.autoJump;
        document.getElementById('mobile-controls-toggle').checked = this.state.settings.mobileControls;
        document.getElementById('accelerometer-toggle').checked = this.state.settings.accelerometer;
        document.getElementById('wind-display-toggle').checked = this.state.settings.windDisplay;
        document.getElementById('debug-info-toggle').checked = this.state.settings.debugInfo;
        
        
        document.getElementById('auto-jump-toggle').onchange = (e) => {
            this.state.settings.autoJump = e.target.checked;
            this.saveData();
            this.applySettings();
        };
        
        document.getElementById('mobile-controls-toggle').onchange = (e) => {
            this.state.settings.mobileControls = e.target.checked;
            this.saveData();
            this.applySettings();
        };
        
        document.getElementById('accelerometer-toggle').onchange = (e) => {
            this.state.settings.accelerometer = e.target.checked;
            this.saveData();
            this.applySettings();
        };
        
        document.getElementById('wind-display-toggle').onchange = (e) => {
            this.state.settings.windDisplay = e.target.checked;
            this.saveData();
            this.applySettings();
        };
        
        document.getElementById('debug-info-toggle').onchange = (e) => {
            this.state.settings.debugInfo = e.target.checked;
            this.saveData();
            this.applySettings();
        };
        
        
        document.getElementById('add-coins-btn').onclick = () => {
            this.state.totalCoins += 1000;
            this.saveData();
            this.updateCoinsDisplay();
            this.showNotification('Added 1000 coins!', 'success');
        };
        
        
        document.getElementById('reset-progress-btn').onclick = () => {
            if (confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
                this.resetData();
                this.updateMainMenu();
                this.showNotification('All data has been reset', 'warning');
            }
        };
        
        document.getElementById('request-accelerometer-btn').onclick = async () => {
            if (typeof DeviceOrientationEvent !== 'undefined' && 
                typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    const permission = await DeviceOrientationEvent.requestPermission();
                    if (permission === 'granted') {
                        this.showNotification('Accelerometer access granted!', 'success');
                        if (window.Game && Game.setupIOSAccelerometer) {
                            Game.setupIOSAccelerometer();
                        }
                    } else {
                        this.showNotification('Accelerometer access denied', 'error');
                    }
                } catch (error) {
                    console.error('Error requesting accelerometer permission:', error);
                    this.showNotification('Failed to request access', 'error');
                }
            } else {
                this.showNotification('Accelerometer already available', 'info');
            }
        };
    },

    
    getUpgradeLevelBar(current, max) {
        let bar = '';
        for (let i = 0; i < max; i++) {
            bar += `<span class="level-dot ${i < current ? 'active' : ''}"></span>`;
        }
        return bar;
    },

    
    unlockBall(ballType) {
        const cost = GameConfig.getBallUnlockPrice(ballType);
        
        if (this.state.totalCoins >= cost && !this.state.unlockedBalls.includes(ballType)) {
            this.state.totalCoins -= cost;
            this.state.unlockedBalls.push(ballType);
            this.saveData();
            
            
            this.updateBallsScreen();
            this.updateMainMenu();
            this.updateCoinsDisplay();
            
            this.showNotification(`Unlocked ball: ${GameConfig.getBallDisplayName(ballType)}!`, 'success');
        } else if (this.state.unlockedBalls.includes(ballType)) {
            this.showNotification('Ball already unlocked!', 'warning');
        } else {
            this.showNotification('You don\'t have enough coins!', 'error');
        }
    },

    
    selectBall(ballType) {
        if (this.state.unlockedBalls.includes(ballType)) {
            this.state.currentBall = ballType;
            this.saveData();
            this.updateBallsScreen();
            this.showNotification(`Selected ball: ${GameConfig.getBallDisplayName(ballType)}`, 'success');
        } else {
            this.showNotification('Unlock this ball first!', 'warning');
        }
    },

    
    buyUpgrade(ballType, upgradeId) {
        const upgradeDef = GameConfig.getUpgradeDefinitions(ballType).find(u => u.id === upgradeId);
        if (!upgradeDef) return;
        
        const currentLevel = this.state.upgrades[ballType]?.[upgradeId]?.level || 0;
        const nextPrice = GameConfig.getUpgradePrice(upgradeDef.basePrice, currentLevel + 1);
        
        if (this.state.totalCoins >= nextPrice && currentLevel < upgradeDef.maxLevel) {
            this.state.totalCoins -= nextPrice;
            
            
            if (!this.state.upgrades[ballType]) {
                this.state.upgrades[ballType] = {};
            }
            
            this.state.upgrades[ballType][upgradeId] = {
                level: currentLevel + 1,
                active: true
            };
            
            this.saveData();
            this.updateUpgradesScreen();
            this.updateMainMenu();
            this.updateCoinsDisplay();
            
            this.showNotification(`Purchased: ${upgradeDef.name} (level ${currentLevel + 1})`, 'success');
        } else {
            this.showNotification('You don\'t have enough coins!', 'error');
        }
    },

    
    toggleUpgrade(ballType, upgradeId) {
        const upgrade = this.state.upgrades[ballType]?.[upgradeId];
        if (upgrade) {
            upgrade.active = !upgrade.active;
            this.saveData();
            this.updateUpgradesScreen();
            
            const state = upgrade.active ? 'enabled' : 'disabled';
            this.showNotification(`Upgrade ${state}`, 'success');
        }
    },

    
    startGame() {
        console.log('Starting game...');
        console.log('State before starting:',
            `scoreInGame=${this.state.scoreInGame},`,
            `coinsInGame=${this.state.coinsInGame},`,
            `totalCoins=${this.state.totalCoins}`);
        
        
        this.state.gameStarted = true;
        this.state.isPaused = false;
        this.state.isGameOver = false;
        this.state.coinsInGame = 0;
        this.state.scoreInGame = 0;
        
        
        this.switchScreen('game');
        
        
        this.updateGameHUD();
        
        
        if (window.Game && Game.startGame) {
            Game.startGame(this.state.currentBall, this.getActiveUpgrades());
        }
    
        
        this.applySettings();
    
        this.showNotification('Game started! Use arrows or A/D to move.');
    },

    
    togglePause() {
        if (!this.state.gameStarted || this.state.isGameOver) return;

        this.state.isPaused = !this.state.isPaused;

        const pauseMenu = document.getElementById('pause-menu');
        const gameScreen = document.getElementById('game-screen');

        if (this.state.isPaused) {
            if (pauseMenu) {
                pauseMenu.classList.remove('hidden');
            }

            
            if (window.Game && Game.setPaused) {
                Game.setPaused(true);
            }

            
            document.getElementById('pause-score').textContent = Math.floor(this.state.scoreInGame);
            document.getElementById('pause-coins').textContent = this.state.coinsInGame;
            document.getElementById('pause-ball').textContent = GameConfig.getBallDisplayName(this.state.currentBall);
        } else {
            if (pauseMenu) {
                pauseMenu.classList.add('hidden');
            }

            
            if (window.Game && Game.setPaused) {
                Game.setPaused(false);
            }
        }
    },

    
    gameOver() {
        if (!this.state.gameStarted || this.state.isGameOver) return;

        console.log('=== GAME OVER ===');
        console.log(`Score: ${this.state.scoreInGame}`);
        console.log(`Coins in this game: ${this.state.coinsInGame}`);
        console.log(`Total coins before: ${this.state.totalCoins}`);

        this.state.isGameOver = true;
        this.state.gameStarted = false;

        
        const isNewHighScore = this.state.scoreInGame > this.state.bestScore;
        if (isNewHighScore) {
            this.state.bestScore = Math.floor(this.state.scoreInGame);
            console.log(`NEW RECORD! ${this.state.scoreInGame}`);
        }

        
        const coinsBefore = this.state.totalCoins;
        this.state.totalCoins += this.state.coinsInGame;
        console.log(`Added ${this.state.coinsInGame} coins. Total coins after: ${this.state.totalCoins}`);

        
        this.saveData();

        
        const gameOverScreen = document.getElementById('game-over-screen');
        if (gameOverScreen) {
            gameOverScreen.classList.remove('hidden');

            
            document.getElementById('final-score').textContent = Math.floor(this.state.scoreInGame);
            document.getElementById('final-coins').textContent = this.state.coinsInGame;
            document.getElementById('final-highscore').textContent = this.state.bestScore;

            
            document.getElementById('coins-value').textContent = this.state.totalCoins;

            
            const messageEl = document.getElementById('game-over-message-text');
            let message = 'Try again!';

            if (isNewHighScore) {
                message = 'NEW RECORD! 🎉';
            }
            if (this.state.coinsInGame > 50) {
                message += ' Great coin haul! 💰';
            } else if (this.state.coinsInGame > 20) {
                message += ' Good haul!';
            }

            if (messageEl) {
                messageEl.textContent = message;
            }
        }

        
        this.updateMainMenu();
        this.updateCoinsDisplay();

        console.log('=== END OF GAME OVER ===');
    },

    
    updateGameHUD() {
        
        const scoreValue = document.getElementById('score-value');
        if (scoreValue) scoreValue.textContent = Math.floor(this.state.scoreInGame);
        
        
        const coinsValue = document.getElementById('coins-value');
        if (coinsValue) coinsValue.textContent = this.state.coinsInGame;
    },

    
    updateCoinsDisplay() {
        
        const totalCoinsEl = document.getElementById('total-coins');
        if (totalCoinsEl) totalCoinsEl.textContent = this.state.totalCoins;
        
        
        const ballsCoins = document.getElementById('balls-coins');
        if (ballsCoins) ballsCoins.textContent = this.state.totalCoins;
        
        
        const upgradesCoins = document.getElementById('upgrades-coins');
        if (upgradesCoins) upgradesCoins.textContent = this.state.totalCoins;
    },

    
    applySettings() {
        if (!window.Game) return;
        
        
        if (window.GameConfig) {
            GameConfig.AUTO_JUMP_ENABLED = this.state.settings.autoJump;
            GameConfig.MOBILE_CONTROLS_ENABLED = this.state.settings.mobileControls;
            GameConfig.USE_ACCELEROMETER = this.state.settings.accelerometer;
            
            
            if (window.Game.applySettings) {
                window.Game.applySettings();
            }
        }
        
        
        if (window.Game && window.Game.state) {
            window.Game.state.settings = this.state.settings;
        }
    },

    
    getActiveUpgrades() {
        const upgrades = this.state.upgrades[this.state.currentBall] || {};
        const activeUpgrades = {};
        
        Object.entries(upgrades).forEach(([id, data]) => {
            if (data.level > 0 && data.active !== false) {
                activeUpgrades[id] = data;
            }
        });
        
        return activeUpgrades;
    },

    
    showNotification(message, type = 'info') {
        console.log('Notification:', message, type);
        
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        
        setTimeout(() => {
            if (notification.parentNode === container) {
                container.removeChild(notification);
            }
        }, 3000);
    },

    
// ... (reszta kodu bez zmian) ...

    setupEventListeners() {
        console.log('Configuring event listeners...');

        // Play button
        document.getElementById('play-btn').addEventListener('click', (e) => {
            if (document.body.classList.contains('standalone')) {
                e.preventDefault();
                e.stopPropagation();
            }
            console.log('Play button clicked');
            this.startGame();
        });

        // Balls button
        document.getElementById('balls-btn').addEventListener('click', (e) => {
            if (document.body.classList.contains('standalone')) {
                e.preventDefault();
                e.stopPropagation();
            }
            console.log('Balls button clicked');
            this.switchScreen('balls');
        });

        // Upgrades button
        document.getElementById('upgrades-btn').addEventListener('click', (e) => {
            if (document.body.classList.contains('standalone')) {
                e.preventDefault();
                e.stopPropagation();
            }
            console.log('Upgrades button clicked');
            this.switchScreen('upgrades');
        });

        // Settings button
        document.getElementById('settings-btn').addEventListener('click', (e) => {
            if (document.body.classList.contains('standalone')) {
                e.preventDefault();
                e.stopPropagation();
            }
            console.log('Settings button clicked');
            this.switchScreen('settings');
        });

        // Back buttons - użyj event delegation dla wszystkich
        document.addEventListener('click', (e) => {
            if (e.target.closest && e.target.closest('.back-btn')) {
                if (document.body.classList.contains('standalone')) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                console.log('Back button clicked');
                this.switchScreen('start');
            }
        });

        // Pause button - UŻYJ EVENT DELEGATION dla standalone
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            // Usuń stare event listeners
            const newPauseBtn = pauseBtn.cloneNode(true);
            pauseBtn.parentNode.replaceChild(newPauseBtn, pauseBtn);

            newPauseBtn.addEventListener('click', (e) => {
                console.log('Pause button clicked (direct listener)');
                e.preventDefault();
                e.stopPropagation();
                this.togglePause();
                return false;
            });

            // Dodaj touch event dla standalone
            newPauseBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                newPauseBtn.click();
                return false;
            }, { passive: false });
        }

        // Resume button
        const resumeBtn = document.getElementById('resume-btn');
        if (resumeBtn) {
            const newResumeBtn = resumeBtn.cloneNode(true);
            resumeBtn.parentNode.replaceChild(newResumeBtn, resumeBtn);

            newResumeBtn.addEventListener('click', (e) => {
                console.log('Resume button clicked');
                e.preventDefault();
                e.stopPropagation();
                this.togglePause();
                return false;
            });
        }

        // Restart button
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            const newRestartBtn = restartBtn.cloneNode(true);
            restartBtn.parentNode.replaceChild(newRestartBtn, restartBtn);

            newRestartBtn.addEventListener('click', (e) => {
                console.log('Restart button clicked');
                e.preventDefault();
                e.stopPropagation();

                this.saveGameProgress(true);
                this.state.coinsInGame = 0;
                document.getElementById('pause-menu').classList.add('hidden');
                this.startGame();
                return false;
            });
        }

        // Quit to menu button
        const quitToMenuBtn = document.getElementById('quit-to-menu-btn');
        if (quitToMenuBtn) {
            const newQuitToMenuBtn = quitToMenuBtn.cloneNode(true);
            quitToMenuBtn.parentNode.replaceChild(newQuitToMenuBtn, quitToMenuBtn);

            newQuitToMenuBtn.addEventListener('click', (e) => {
                console.log('Quit to menu button clicked');
                e.preventDefault();
                e.stopPropagation();

                this.saveGameProgress(true);
                this.state.coinsInGame = 0;
                document.getElementById('pause-menu').classList.add('hidden');
                this.switchScreen('start');
                return false;
            });
        }

        // Play again button
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            const newPlayAgainBtn = playAgainBtn.cloneNode(true);
            playAgainBtn.parentNode.replaceChild(newPlayAgainBtn, playAgainBtn);

            newPlayAgainBtn.addEventListener('click', (e) => {
                console.log('Play again button clicked');
                e.preventDefault();
                e.stopPropagation();

                this.saveGameProgress(false);
                this.state.coinsInGame = 0;
                document.getElementById('game-over-screen').classList.add('hidden');
                this.startGame();
                return false;
            });
        }

        // Quit after game button
        const quitAfterGameBtn = document.getElementById('quit-after-game-btn');
        if (quitAfterGameBtn) {
            const newQuitAfterGameBtn = quitAfterGameBtn.cloneNode(true);
            quitAfterGameBtn.parentNode.replaceChild(newQuitAfterGameBtn, quitAfterGameBtn);

            newQuitAfterGameBtn.addEventListener('click', (e) => {
                console.log('Quit after game button clicked');
                e.preventDefault();
                e.stopPropagation();

                document.getElementById('game-over-screen').classList.add('hidden');
                this.switchScreen('start');
                return false;
            });
        }

        // Keyboard events
        document.addEventListener('keydown', (e) => {

            if (e.key === 'p' || e.key === 'P') {
                if (this.state.gameStarted && !this.state.isGameOver) {
                    this.togglePause();
                }
            }


            if (e.key === 'Escape') {
                if (this.state.isPaused) {
                    this.togglePause();
                } else if (this.state.isGameOver) {
                    this.switchScreen('start');
                } else if (this.state.currentScreen === 'game') {
                    this.togglePause();
                } else {
                    this.switchScreen('start');
                }
            }
        });


        document.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('gesturestart', function(e) {
            e.preventDefault();
        });

        console.log('Event listeners configured');
    },

// ... (reszta kodu bez zmian) ...

    
    saveGameProgress(shouldAddToTotal = true) {
        console.log('Saving progress...', 
            `coinsInGame: ${this.state.coinsInGame}, totalCoins before: ${this.state.totalCoins}`);
        
        if (shouldAddToTotal && this.state.coinsInGame > 0) {
            
            this.state.totalCoins += this.state.coinsInGame;
            console.log(`Added ${this.state.coinsInGame} coins. New totalCoins: ${this.state.totalCoins}`);
        }
        
        
        this.saveData();
        
        
        this.updateMainMenu();
        this.updateCoinsDisplay();
    },

    
    updateUI() {
        this.updateMainMenu();
        this.updateCoinsDisplay();
        
        
        if (this.state.gameStarted) {
            this.updateGameHUD();
        }
    }
};


window.Menu = Menu;
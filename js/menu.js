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
        isStandalone: false,
        settings: {
            autoJump: true,               
            mobileControls: true,         
            accelerometer: false,         // Domyslnie false, bo wymaga permisji
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

    // Debouncing variables
    lastClickTime: 0,
    debounceDelay: 350, // Zwiększone dla iOS standalone
    
    // Input handling
    keys: {},
    touchActive: false,
    touchDirection: 0,
    
    init() {
        console.log('Menu.init() - Initializing menu system');
        
        this.checkMobile();
        this.checkStandalone();
        this.loadData();
        
        // Setup event listeners - teraz delegacja zdarzeń
        this.setupEventDelegation();
        
        // Update UI
        this.updateAllUI();
        
        // Initialize screens
        this.switchScreen('start');
        
        // Apply settings
        this.applySettings();
        
        console.log('Menu initialized - iOS standalone aware');
    },
    
    checkMobile() {
        this.state.isMobile = window.innerWidth <= GameConfig.MOBILE_BREAKPOINT || 
                              /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (this.state.isMobile) {
            document.body.classList.add('mobile');
            console.log('Mobile device detected');
        }
    },
    
    checkStandalone() {
        this.state.isStandalone = window.navigator.standalone || 
                                 (window.matchMedia('(display-mode: standalone)').matches);
        
        if (this.state.isStandalone) {
            document.body.classList.add('standalone');
            console.log('Running in standalone/PWA mode');
        }
    },
    
    // Event Delegation - główna zmiana!
    setupEventDelegation() {
        console.log('Setting up event delegation...');
        
        // Delegacja kliknięć na cały dokument
        document.addEventListener('click', (e) => {
            this.handleClick(e);
        }, true); // Używamy capture phase dla lepszej kontroli
        
        // Delegacja touch events dla kontrolek mobilnych
        document.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        }, { passive: false });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        // Swipe/gesture prevention
        document.addEventListener('touchmove', (e) => {
            if (e.target.type === 'range') return;
            e.preventDefault();
        }, { passive: false });
        
        // iOS specific accelerometer setup
        this.setupIOSAccelerometer();
    },
    
    // Główny handler kliknięć
    handleClick(e) {
        // Debounce dla iOS standalone
        const now = Date.now();
        if (now - this.lastClickTime < this.debounceDelay) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Click debounced for iOS standalone');
            return;
        }
        this.lastClickTime = now;
        
        // Znajdź najbliższy kliknięty element z data-action
        const target = e.target.closest('[data-action], [data-target]');
        if (!target) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        // Dodaj wizualną odpowiedź
        this.addButtonFeedback(target);
        
        // Obsługa data-target (back buttons)
        if (target.dataset.target) {
            this.switchScreen(target.dataset.target);
            return;
        }
        
        // Obsługa data-action
        if (target.dataset.action) {
            this.handleAction(target.dataset.action, target);
        }
    },
    
    // Handler dla akcji
    handleAction(action, element) {
        console.log('Action triggered:', action, element);
        
        switch(action) {
            // Main menu actions
            case 'play':
                this.startGame();
                break;
            case 'balls':
                this.switchScreen('balls');
                break;
            case 'upgrades':
                this.switchScreen('upgrades');
                break;
            case 'settings':
                this.switchScreen('settings');
                break;
                
            // Ball selection actions
            case 'select-ball':
                const ballType = element.dataset.ball || element.closest('[data-ball]')?.dataset.ball;
                if (ballType) this.selectBall(ballType);
                break;
            case 'unlock-ball':
                const unlockBallType = element.dataset.ball || element.closest('[data-ball]')?.dataset.ball;
                if (unlockBallType) this.unlockBall(unlockBallType);
                break;
                
            // Game control actions
            case 'pause':
                this.togglePause();
                break;
            case 'resume':
                this.togglePause();
                break;
            case 'restart':
                this.restartGame();
                break;
            case 'quit-to-menu':
                this.quitToMenu();
                break;
            case 'play-again':
                this.playAgain();
                break;
            case 'quit-after-game':
                this.quitAfterGame();
                break;
                
            // Settings actions
            case 'add-coins':
                this.addCoins(1000);
                break;
            case 'reset-progress':
                this.resetProgress();
                break;
            case 'request-accelerometer':
                this.requestAccelerometerPermission();
                break;
                
            // Upgrade actions
            case 'buy-upgrade':
                const upgradeId = element.dataset.upgrade;
                const ballForUpgrade = element.dataset.ball;
                if (upgradeId && ballForUpgrade) this.buyUpgrade(ballForUpgrade, upgradeId);
                break;
            case 'toggle-upgrade':
                const toggleUpgradeId = element.dataset.upgrade;
                const toggleBall = element.dataset.ball;
                if (toggleUpgradeId && toggleBall) this.toggleUpgrade(toggleBall, toggleUpgradeId);
                break;
                
            // Mobile controls
            case 'move-left':
                this.handleMove(-1);
                break;
            case 'move-right':
                this.handleMove(1);
                break;
        }
    },
    
    // Touch handling dla kontrolek mobilnych
    handleTouchStart(e) {
        e.preventDefault();
        
        // Sprawdź czy to kontrolka mobilna
        const control = e.target.closest('[data-action="move-left"], [data-action="move-right"]');
        if (control) {
            const action = control.dataset.action;
            if (action === 'move-left') this.handleMove(-1);
            else if (action === 'move-right') this.handleMove(1);
        }
    },
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.handleMove(0);
    },
    
    handleMove(direction) {
        if (window.Game) {
            Game.touchActive = direction !== 0;
            Game.touchDirection = direction;
        }
    },
    
    handleKeyDown(e) {
        this.keys[e.key] = true;
        
        // Keyboard shortcuts
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
    },
    
    addButtonFeedback(element) {
        // Dodaj klasę active dla wizualnej odpowiedzi
        element.classList.add('active');
        setTimeout(() => {
            element.classList.remove('active');
        }, 150);
    },
    
    setupIOSAccelerometer() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        if (isIOS && typeof DeviceOrientationEvent !== 'undefined') {
            // Automatyczne żądanie dostępu przy starcie
            if (this.state.settings.accelerometer && typeof DeviceOrientationEvent.requestPermission === 'function') {
                // Opóźnione żądanie, aby nie blokować interfejsu
                setTimeout(() => {
                    DeviceOrientationEvent.requestPermission()
                        .then(permissionState => {
                            if (permissionState === 'granted') {
                                console.log('Accelerometer permission granted on iOS');
                                window.addEventListener('deviceorientation', (e) => {
                                    if (window.Game && Game.handleDeviceOrientation) {
                                        Game.handleDeviceOrientation(e);
                                    }
                                });
                            } else {
                                console.log('Accelerometer permission denied on iOS');
                                this.state.settings.accelerometer = false;
                                this.saveData();
                                this.updateSettingsScreen();
                            }
                        })
                        .catch(error => {
                            console.error('Accelerometer permission error:', error);
                            this.state.settings.accelerometer = false;
                            this.saveData();
                            this.updateSettingsScreen();
                        });
                }, 1000);
            }
        }
    },
    
    async requestAccelerometerPermission() {
        if (typeof DeviceOrientationEvent !== 'undefined' && 
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    this.state.settings.accelerometer = true;
                    this.saveData();
                    this.updateSettingsScreen();
                    this.showNotification('Accelerometer access granted!', 'success');
                    
                    // Dodaj event listener
                    window.addEventListener('deviceorientation', (e) => {
                        if (window.Game && Game.handleDeviceOrientation) {
                            Game.handleDeviceOrientation(e);
                        }
                    });
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
    },
    
    loadData() {
        console.log('Loading game data...');
        
        const savedData = localStorage.getItem('icy_tower_game_data');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                // Merge danych zachowując domyślne wartości
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
                
                console.log('Data loaded successfully');
            } catch (e) {
                console.error('Error loading data:', e);
                this.resetData();
            }
        } else {
            this.resetData();
        }
        
        this.updateCoinsDisplay();
    },
    
    resetData() {
        this.state = {
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
            isMobile: this.state.isMobile,
            isStandalone: this.state.isStandalone,
            settings: {
                autoJump: true,
                mobileControls: true,
                accelerometer: false,
                windDisplay: true,
                debugInfo: false
            },
            upgrades: {
                standard: {},
                rubber: {},
                beach: {},
                golf: {}
            }
        };
        
        localStorage.removeItem('icy_tower_game_data');
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
        
        // Ukryj wszystkie ekrany
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Ukryj overlay menu
        document.getElementById('pause-menu').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        
        // Pokaż docelowy ekran
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.state.currentScreen = screenName;
            
            // Zresetuj scroll
            const screenBody = targetScreen.querySelector('.screen-body');
            if (screenBody) screenBody.scrollTop = 0;
            
            // Aktualizuj UI ekranu
            this.updateScreenUI(screenName);
        }
        
        // Jeśli wychodzimy z gry, zatrzymaj grę
        if (screenName !== 'game') {
            this.state.gameStarted = false;
            this.state.isPaused = false;
            if (window.Game && Game.stopGame) {
                Game.stopGame();
            }
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
            case 'game':
                this.updateGameHUD();
                break;
        }
    },
    
    updateAllUI() {
        this.updateMainMenu();
        this.updateBallsScreen();
        this.updateUpgradesScreen();
        this.updateSettingsScreen();
        this.updateGameHUD();
    },
    
    updateMainMenu() {
        this.updateElement('total-coins', this.state.totalCoins);
        this.updateElement('best-score', this.state.bestScore);
        this.updateElement('unlocked-balls', `${this.state.unlockedBalls.length}/4`);
    },
    
    updateBallsScreen() {
        this.updateElement('balls-coins', this.state.totalCoins);
        
        const balls = ['standard', 'rubber', 'beach', 'golf'];
        balls.forEach(ballType => {
            const ballCard = document.querySelector(`.ball-card[data-ball="${ballType}"]`);
            if (!ballCard) return;
            
            const isUnlocked = this.state.unlockedBalls.includes(ballType);
            const isCurrent = this.state.currentBall === ballType;
            
            ballCard.classList.toggle('locked', !isUnlocked);
            ballCard.classList.toggle('active', isCurrent);
            
            // Zaktualizuj przyciski
            const existingBtn = ballCard.querySelector('button');
            if (existingBtn) existingBtn.remove();
            
            if (isUnlocked) {
                const selectBtn = document.createElement('button');
                selectBtn.className = 'select-ball-btn';
                selectBtn.dataset.action = 'select-ball';
                selectBtn.dataset.ball = ballType;
                selectBtn.textContent = isCurrent ? 'Selected' : 'Select';
                ballCard.appendChild(selectBtn);
            } else {
                const unlockBtn = document.createElement('button');
                unlockBtn.className = 'unlock-btn';
                unlockBtn.dataset.action = 'unlock-ball';
                unlockBtn.dataset.ball = ballType;
                unlockBtn.dataset.cost = GameConfig.getBallUnlockPrice(ballType);
                unlockBtn.innerHTML = `Unlock for ${unlockBtn.dataset.cost} <i class="fas fa-coins"></i>`;
                unlockBtn.disabled = this.state.totalCoins < parseInt(unlockBtn.dataset.cost);
                ballCard.appendChild(unlockBtn);
            }
        });
        
        this.updateElement('current-ball-name', GameConfig.getBallDisplayName(this.state.currentBall));
    },
    
    updateUpgradesScreen() {
        this.updateElement('upgrades-coins', this.state.totalCoins);
        
        // Aktualizuj przyciski wyboru piłki
        const selector = document.querySelector('.ball-selector-buttons');
        if (selector) {
            selector.innerHTML = '';
            
            this.state.unlockedBalls.forEach(ballType => {
                const button = document.createElement('button');
                button.className = `ball-select-btn ${this.state.currentBall === ballType ? 'active' : ''}`;
                button.dataset.action = 'select-upgrade-ball';
                button.dataset.ball = ballType;
                button.textContent = GameConfig.getBallDisplayName(ballType);
                button.addEventListener('click', () => {
                    this.state.currentBall = ballType;
                    this.updateUpgradesScreen();
                });
                selector.appendChild(button);
            });
        }
        
        // Aktualizuj listę ulepszeń
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
                                    data-action="toggle-upgrade"
                                    data-ball="${this.state.currentBall}"
                                    data-upgrade="${upgradeDef.id}">
                                ${isActive ? 'ON' : 'OFF'}
                            </button>
                        ` : ''}
                        <button class="buy-btn" 
                                data-action="buy-upgrade"
                                data-ball="${this.state.currentBall}"
                                data-upgrade="${upgradeDef.id}"
                                ${isMaxLevel || !canAfford ? 'disabled' : ''}>
                            ${isMaxLevel ? 'MAX' : 'Buy'}
                        </button>
                    </div>
                `;
                
                upgradesList.appendChild(upgradeEl);
            });
        }
    },
    
    updateSettingsScreen() {
        // Ustaw wartości przełączników
        this.updateToggle('auto-jump-toggle', this.state.settings.autoJump);
        this.updateToggle('mobile-controls-toggle', this.state.settings.mobileControls);
        this.updateToggle('accelerometer-toggle', this.state.settings.accelerometer);
        this.updateToggle('wind-display-toggle', this.state.settings.windDisplay);
        this.updateToggle('debug-info-toggle', this.state.settings.debugInfo);
        
        // Pokaż/ukryj debug info
        const debugInfo = document.getElementById('debug-info');
        if (debugInfo) {
            debugInfo.classList.toggle('hidden', !this.state.settings.debugInfo);
        }
        
        // Aktualizuj mobilne kontrole
        const mobileControls = document.getElementById('mobile-controls-overlay');
        if (mobileControls) {
            mobileControls.style.display = this.state.settings.mobileControls ? 'flex' : 'none';
        }
    },
    
    updateGameHUD() {
        this.updateElement('score-value', Math.floor(this.state.scoreInGame));
        this.updateElement('coins-value', this.state.coinsInGame);
    },
    
    updateCoinsDisplay() {
        this.updateElement('total-coins', this.state.totalCoins);
        this.updateElement('balls-coins', this.state.totalCoins);
        this.updateElement('upgrades-coins', this.state.totalCoins);
    },
    
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },
    
    updateToggle(id, checked) {
        const toggle = document.getElementById(id);
        if (toggle) toggle.checked = checked;
    },
    
    getUpgradeLevelBar(current, max) {
        let bar = '';
        for (let i = 0; i < max; i++) {
            bar += `<span class="level-dot ${i < current ? 'active' : ''}"></span>`;
        }
        return bar;
    },
    
    startGame() {
        console.log('Starting game with ball:', this.state.currentBall);
        
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
        
        this.showNotification('Game started!', 'success');
    },
    
    togglePause() {
        if (!this.state.gameStarted || this.state.isGameOver) return;
        
        this.state.isPaused = !this.state.isPaused;
        
        if (window.Game) {
            Game.setPaused(this.state.isPaused);
        }
        
        const pauseMenu = document.getElementById('pause-menu');
        if (pauseMenu) {
            pauseMenu.classList.toggle('hidden', !this.state.isPaused);
            
            if (this.state.isPaused) {
                this.updateElement('pause-score', Math.floor(this.state.scoreInGame));
                this.updateElement('pause-coins', this.state.coinsInGame);
                this.updateElement('pause-ball', GameConfig.getBallDisplayName(this.state.currentBall));
            }
        }
    },
    
    restartGame() {
        // Zresetuj stan gry
        this.state.coinsInGame = 0;
        this.state.scoreInGame = 0;
        
        // Ukryj menu
        document.getElementById('pause-menu').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        
        // Restart gry
        if (window.Game && Game.resetGameState) {
            Game.resetGameState();
        }
        
        this.startGame();
    },
    
    quitToMenu() {
        // Zapisz monety z gry
        if (this.state.coinsInGame > 0) {
            this.state.totalCoins += this.state.coinsInGame;
            this.saveData();
            this.updateCoinsDisplay();
        }
        
        // Zresetuj stan gry
        this.state.gameStarted = false;
        this.state.isPaused = false;
        this.state.coinsInGame = 0;
        this.state.scoreInGame = 0;
        
        // Ukryj menu
        document.getElementById('pause-menu').classList.add('hidden');
        
        // Wróć do głównego menu
        this.switchScreen('start');
    },
    
    playAgain() {
        // Zapisz monety z gry
        if (this.state.coinsInGame > 0) {
            this.state.totalCoins += this.state.coinsInGame;
            this.saveData();
            this.updateCoinsDisplay();
        }
        
        // Zresetuj stan gry
        this.state.coinsInGame = 0;
        this.state.scoreInGame = 0;
        
        // Ukryj ekran game over
        document.getElementById('game-over-screen').classList.add('hidden');
        
        // Rozpocznij nową grę
        this.startGame();
    },
    
    quitAfterGame() {
        // Zapisz monety z gry
        if (this.state.coinsInGame > 0) {
            this.state.totalCoins += this.state.coinsInGame;
            this.saveData();
            this.updateCoinsDisplay();
        }
        
        // Zresetuj stan gry
        this.state.gameStarted = false;
        this.state.isGameOver = false;
        this.state.coinsInGame = 0;
        this.state.scoreInGame = 0;
        
        // Ukryj ekran game over
        document.getElementById('game-over-screen').classList.add('hidden');
        
        // Wróć do głównego menu
        this.switchScreen('start');
    },
    
    gameOver() {
        if (!this.state.gameStarted || this.state.isGameOver) return;
        
        console.log('=== GAME OVER ===');
        console.log(`Score: ${this.state.scoreInGame}`);
        console.log(`Coins in this game: ${this.state.coinsInGame}`);
        
        this.state.isGameOver = true;
        this.state.gameStarted = false;
        
        // Sprawdź czy to nowy rekord
        const isNewHighScore = this.state.scoreInGame > this.state.bestScore;
        if (isNewHighScore) {
            this.state.bestScore = Math.floor(this.state.scoreInGame);
        }
        
        // Dodaj monety do total
        this.state.totalCoins += this.state.coinsInGame;
        
        // Zapisz dane
        this.saveData();
        
        // Pokaż ekran game over
        const gameOverScreen = document.getElementById('game-over-screen');
        if (gameOverScreen) {
            gameOverScreen.classList.remove('hidden');
            
            this.updateElement('final-score', Math.floor(this.state.scoreInGame));
            this.updateElement('final-coins', this.state.coinsInGame);
            this.updateElement('final-highscore', this.state.bestScore);
            
            // Aktualizuj komunikat
            const messageEl = document.getElementById('game-over-message-text');
            let message = 'Try again!';
            
            if (isNewHighScore) {
                message = 'NEW RECORD! 🎉';
            }
            if (this.state.coinsInGame > 50) {
                message += ' Great coin haul! 💰';
            }
            
            if (messageEl) messageEl.textContent = message;
        }
        
        // Aktualizuj główne menu
        this.updateMainMenu();
        this.updateCoinsDisplay();
        
        console.log('=== END OF GAME OVER ===');
    },
    
    selectBall(ballType) {
        if (this.state.unlockedBalls.includes(ballType)) {
            this.state.currentBall = ballType;
            this.saveData();
            this.updateBallsScreen();
            this.showNotification(`Selected: ${GameConfig.getBallDisplayName(ballType)}`, 'success');
        }
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
            
            this.showNotification(`Unlocked: ${GameConfig.getBallDisplayName(ballType)}!`, 'success');
        } else if (this.state.unlockedBalls.includes(ballType)) {
            this.showNotification('Ball already unlocked!', 'warning');
        } else {
            this.showNotification('You don\'t have enough coins!', 'error');
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
    
    addCoins(amount) {
        this.state.totalCoins += amount;
        this.saveData();
        this.updateAllUI();
        this.showNotification(`Added ${amount} coins!`, 'success');
    },
    
    resetProgress() {
        if (confirm('Are you sure you want to reset all progress? This will delete all saved data including coins, unlocked balls, and upgrades.')) {
            this.resetData();
            this.updateAllUI();
        }
    },
    
    applySettings() {
        // Przekaż ustawienia do Game
        if (window.Game && Game.applySettings) {
            Game.applySettings();
        }
        
        // Zastosuj ustawienia lokalnie
        if (this.state.settings.debugInfo) {
            document.getElementById('debug-info')?.classList.remove('hidden');
        } else {
            document.getElementById('debug-info')?.classList.add('hidden');
        }
        
        // Pokaż/ukryj mobilne kontrole
        const mobileControls = document.getElementById('mobile-controls-overlay');
        if (mobileControls) {
            mobileControls.style.display = this.state.settings.mobileControls ? 'flex' : 'none';
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
    }
};

// Inicjalizacja Menu
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.Menu) Menu.init();
    });
} else {
    if (window.Menu) Menu.init();
}

window.Menu = Menu;
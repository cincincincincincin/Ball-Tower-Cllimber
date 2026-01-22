// single-tap.js - Single Source of Truth dla wszystkich eventów
(function() {
    'use strict';
    
    console.log('Loading Single Tap Event System...');
    
    // Globalne flagi
    let isProcessing = false;
    let lastTapTime = 0;
    let lastTapTarget = null;
    const TAP_DELAY = 300; // 300ms między kliknięciami
    
    // Detekcja trybu
    const isStandalone = window.navigator.standalone || 
                        window.matchMedia('(display-mode: standalone)').matches;
    
    // Single Tap System
    class SingleTapSystem {
        constructor() {
            this.initialized = false;
            this.eventMap = new Map();
            this.setup();
        }
        
        setup() {
            if (this.initialized) return;
            
            console.log('Setting up Single Tap System...');
            
            // 1. USUŃ WSZYSTKIE ISTNIEJĄCE EVENT LISTENERS
            this.removeAllExistingListeners();
            
            // 2. DODAJ GLOBALNY EVENT LISTENER (JEDYNY)
            this.addGlobalEventListener();
            
            // 3. OBSERWATOR DLA DYNAMICZNYCH ELEMENTÓW
            this.setupMutationObserver();
            
            // 4. INICJALIZACJA SPECJALNYCH ELEMENTÓW
            this.initializeSpecialElements();
            
            this.initialized = true;
            console.log('Single Tap System initialized');
        }
        
        removeAllExistingListeners() {
            console.log('Removing existing listeners...');
            
            // Usuń event listeners z wszystkich przycisków
            document.querySelectorAll('button').forEach(btn => {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                newBtn._singleTapProcessed = true;
            });
            
            // Usuń event listeners z sliderów
            document.querySelectorAll('input[type="checkbox"]').forEach(input => {
                const newInput = input.cloneNode(true);
                input.parentNode.replaceChild(newInput, input);
                newInput._singleTapProcessed = true;
            });
        }
        
        addGlobalEventListener() {
            console.log('Adding global event listener...');
            
            // KLIKNIĘCIA
            document.addEventListener('click', (e) => {
                this.handleEvent(e);
            }, true); // Użyj capture phase
            
            // DOTYK (dla mobilnych)
            document.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    this.handleEvent(e);
                }
            }, { passive: true });
            
            // KEYBOARD - tylko dla pauzy (zapobieganie duplikacji)
            document.addEventListener('keydown', (e) => {
                if ((e.key === 'p' || e.key === 'P') && !isProcessing) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.executeAction('keyboard-pause');
                }
            });
        }
        
        handleEvent(event) {
            // Zapobiegaj domyślnej akcji
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            
            const target = event.target;
            const now = Date.now();
            
            // ANTY-DUPLIKACJA: Sprawdź czy to nie jest szybkie wielokrotne kliknięcie
            if (isProcessing) {
                console.log('Already processing, ignoring');
                return false;
            }
            
            if (target === lastTapTarget && (now - lastTapTime) < TAP_DELAY) {
                console.log('Quick retap ignored');
                return false;
            }
            
            // Ustaw flagi
            isProcessing = true;
            lastTapTarget = target;
            lastTapTime = now;
            
            // Obsłuż event
            setTimeout(() => {
                try {
                    this.processEvent(target, event.type);
                } catch (error) {
                    console.error('Error processing event:', error);
                }
                
                // Reset flagi
                setTimeout(() => {
                    isProcessing = false;
                }, 50);
            }, 10);
            
            return false;
        }
        
        processEvent(target, eventType) {
            console.log('Processing:', eventType, target.tagName, target.id, target.className);
            
            // 1. PRZYCISK
            const button = target.closest('button');
            if (button && !button.disabled) {
                this.handleButton(button);
                return;
            }
            
            // 2. SLIDER
            const slider = target.closest('input[type="checkbox"]');
            if (slider) {
                this.handleSlider(slider);
                return;
            }
            
            // 3. LABEL dla slidera
            const label = target.closest('label.switch');
            if (label) {
                const slider = label.querySelector('input[type="checkbox"]');
                if (slider) {
                    slider.checked = !slider.checked;
                    this.handleSlider(slider);
                }
                return;
            }
            
            // 4. ELEMENTY HUD w grze
            if (target.classList.contains('hud-btn') || 
                target.closest('.hud-btn')) {
                const hudBtn = target.closest('.hud-btn');
                if (hudBtn) this.handleButton(hudBtn);
                return;
            }
            
            console.log('Unhandled target:', target);
        }
        
        handleButton(button) {
            const buttonId = button.id;
            const buttonClass = button.className;
            
            console.log('Button clicked:', buttonId || 'no-id', buttonClass);
            
            // Mapowanie przycisków do akcji
            const actionMap = {
                // MENU GŁÓWNE
                'play-btn': () => this.executeMenuAction('startGame'),
                'balls-btn': () => this.executeMenuAction('switchScreen', 'balls'),
                'upgrades-btn': () => this.executeMenuAction('switchScreen', 'upgrades'),
                'settings-btn': () => this.executeMenuAction('switchScreen', 'settings'),
                
                // PAUZA
                'pause-btn': () => this.executeMenuAction('togglePause'),
                'resume-btn': () => this.executeMenuAction('togglePause'),
                'restart-btn': () => this.executeGameAction('restart'),
                'quit-to-menu-btn': () => this.executeGameAction('quitToMenu'),
                
                // GAME OVER
                'play-again-btn': () => this.executeGameAction('playAgain'),
                'quit-after-game-btn': () => this.executeMenuAction('switchScreen', 'start'),
                
                // USTAWIENIA
                'add-coins-btn': () => this.executeSettingsAction('addCoins'),
                'reset-progress-btn': () => this.executeSettingsAction('resetProgress'),
                'request-accelerometer-btn': () => this.executeSettingsAction('requestAccelerometer'),
            };
            
            // Sprawdź ID przycisku
            if (buttonId && actionMap[buttonId]) {
                actionMap[buttonId]();
                return;
            }
            
            // Sprawdź klasy przycisku
            if (buttonClass.includes('back-btn')) {
                this.executeMenuAction('switchScreen', 'start');
                return;
            }
            
            if (buttonClass.includes('select-ball-btn')) {
                const ballCard = button.closest('.ball-card');
                if (ballCard) {
                    const ballType = ballCard.dataset.ball;
                    this.executeMenuAction('selectBall', ballType);
                }
                return;
            }
            
            if (buttonClass.includes('unlock-btn')) {
                const ballCard = button.closest('.ball-card');
                if (ballCard) {
                    const ballType = ballCard.dataset.ball;
                    this.executeMenuAction('unlockBall', ballType);
                }
                return;
            }
            
            if (buttonClass.includes('buy-btn') && !button.disabled) {
                const upgradeItem = button.closest('.upgrade-item');
                if (upgradeItem) {
                    const ballType = button.dataset.ballType || this.getCurrentBallType();
                    const upgradeId = button.dataset.upgradeId || this.getUpgradeIdFromElement(upgradeItem);
                    
                    if (ballType && upgradeId) {
                        this.executeMenuAction('buyUpgrade', { ballType, upgradeId });
                    }
                }
                return;
            }
            
            if (buttonClass.includes('toggle-btn')) {
                const upgradeItem = button.closest('.upgrade-item');
                if (upgradeItem) {
                    const ballType = button.dataset.ballType || this.getCurrentBallType();
                    const upgradeId = button.dataset.upgradeId || this.getUpgradeIdFromElement(upgradeItem);
                    
                    if (ballType && upgradeId) {
                        this.executeMenuAction('toggleUpgrade', { ballType, upgradeId });
                    }
                }
                return;
            }
            
            if (buttonClass.includes('ball-select-btn') && !buttonClass.includes('active')) {
                const ballName = button.textContent.trim();
                const ballType = this.getBallTypeFromName(ballName);
                if (ballType) {
                    this.executeMenuAction('selectBallForUpgrades', ballType);
                }
                return;
            }
        }
        
        handleSlider(slider) {
            const settingMap = {
                'auto-jump-toggle': 'autoJump',
                'mobile-controls-toggle': 'mobileControls',
                'accelerometer-toggle': 'accelerometer',
                'wind-display-toggle': 'windDisplay',
                'debug-info-toggle': 'debugInfo'
            };
            
            const settingKey = settingMap[slider.id];
            if (settingKey && window.Menu) {
                window.Menu.state.settings[settingKey] = slider.checked;
                window.Menu.saveData();
                window.Menu.applySettings();
                
                console.log('Setting updated:', settingKey, slider.checked);
            }
        }
        
        // WYKONYWANIE AKCJI
        executeMenuAction(action, data = null) {
            if (!window.Menu) {
                console.error('Menu not available');
                return;
            }
            
            console.log('Executing menu action:', action, data);
            
            switch(action) {
                case 'startGame':
                    window.Menu.startGame();
                    break;
                case 'switchScreen':
                    window.Menu.switchScreen(data);
                    break;
                case 'selectBall':
                    window.Menu.selectBall(data);
                    break;
                case 'unlockBall':
                    window.Menu.unlockBall(data);
                    break;
                case 'buyUpgrade':
                    window.Menu.buyUpgrade(data.ballType, data.upgradeId);
                    break;
                case 'toggleUpgrade':
                    window.Menu.toggleUpgrade(data.ballType, data.upgradeId);
                    break;
                case 'togglePause':
                    window.Menu.togglePause();
                    break;
                case 'selectBallForUpgrades':
                    window.Menu.state.currentBall = data;
                    window.Menu.updateUpgradesScreen();
                    break;
            }
        }
        
        executeGameAction(action) {
            console.log('Executing game action:', action);
            
            switch(action) {
                case 'restart':
                    if (window.Menu) {
                        window.Menu.saveGameProgress(true);
                        window.Menu.state.coinsInGame = 0;
                        document.getElementById('pause-menu').classList.add('hidden');
                        window.Menu.startGame();
                    }
                    break;
                case 'quitToMenu':
                    if (window.Menu) {
                        window.Menu.saveGameProgress(true);
                        window.Menu.state.coinsInGame = 0;
                        document.getElementById('pause-menu').classList.add('hidden');
                        window.Menu.switchScreen('start');
                    }
                    break;
                case 'playAgain':
                    if (window.Menu) {
                        window.Menu.saveGameProgress(false);
                        window.Menu.state.coinsInGame = 0;
                        document.getElementById('game-over-screen').classList.add('hidden');
                        window.Menu.startGame();
                    }
                    break;
            }
        }
        
        executeSettingsAction(action) {
            console.log('Executing settings action:', action);
            
            switch(action) {
                case 'addCoins':
                    if (window.Menu) {
                        window.Menu.state.totalCoins += 1000;
                        window.Menu.saveData();
                        window.Menu.updateCoinsDisplay();
                        window.Menu.showNotification('Added 1000 coins!', 'success');
                    }
                    break;
                    
                case 'resetProgress':
                    this.showCustomConfirm(
                        'Reset Progress',
                        'Are you sure you want to reset all progress? This action cannot be undone.',
                        () => {
                            if (window.Menu) {
                                window.Menu.resetData();
                                window.Menu.updateMainMenu();
                                window.Menu.showNotification('All data has been reset', 'warning');
                            }
                        }
                    );
                    break;
                    
                case 'requestAccelerometer':
                    this.requestAccelerometerAccess();
                    break;
                    
                case 'keyboard-pause':
                    if (window.Menu && window.Menu.togglePause) {
                        window.Menu.togglePause();
                    }
                    break;
            }
        }
        
        // POMOCNICZE FUNKCJE
        getCurrentBallType() {
            return window.Menu ? window.Menu.state.currentBall : 'standard';
        }
        
        getUpgradeIdFromElement(element) {
            const title = element.querySelector('h4');
            if (!title) return null;
            
            // Przykład: "Jump Power (1/5)" → "jump-power"
            const name = title.textContent.split('(')[0].trim().toLowerCase().replace(/\s+/g, '-');
            return name;
        }
        
        getBallTypeFromName(displayName) {
            const ballTypes = ['standard', 'rubber', 'beach', 'golf'];
            for (const type of ballTypes) {
                if (GameConfig.getBallDisplayName(type) === displayName) {
                    return type;
                }
            }
            return null;
        }
        
        showCustomConfirm(title, message, onConfirm) {
            const modal = document.createElement('div');
            modal.className = 'custom-confirm-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            `;
            
            modal.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    border-radius: 20px;
                    padding: 25px;
                    max-width: 90%;
                    width: 350px;
                    border: 2px solid rgba(74, 159, 255, 0.3);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                    text-align: center;
                ">
                    <h3 style="color: #fff; margin-bottom: 15px; font-family: 'Orbitron', sans-serif;">
                        ${title}
                    </h3>
                    <p style="color: #aaa; margin-bottom: 25px; line-height: 1.5;">
                        ${message}
                    </p>
                    <div style="display: flex; gap: 15px;">
                        <button class="confirm-cancel" style="
                            flex: 1;
                            padding: 12px;
                            background: rgba(255,107,107,0.2);
                            border: 2px solid rgba(255,107,107,0.3);
                            border-radius: 12px;
                            color: white;
                            font-size: 16px;
                            cursor: pointer;
                        ">Cancel</button>
                        <button class="confirm-ok" style="
                            flex: 1;
                            padding: 12px;
                            background: linear-gradient(135deg, rgba(74,159,255,0.2), rgba(74,255,74,0.1));
                            border: 2px solid rgba(74,159,255,0.3);
                            border-radius: 12px;
                            color: white;
                            font-size: 16px;
                            cursor: pointer;
                        ">OK</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Event listeners dla przycisków w modal
            modal.querySelector('.confirm-cancel').addEventListener('click', (e) => {
                e.stopPropagation();
                document.body.removeChild(modal);
            });
            
            modal.querySelector('.confirm-ok').addEventListener('click', (e) => {
                e.stopPropagation();
                document.body.removeChild(modal);
                if (onConfirm) onConfirm();
            });
            
            // Zapobiegaj propagacji kliknięć na tło
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        }
        
        async requestAccelerometerAccess() {
            if (typeof DeviceOrientationEvent !== 'undefined' && 
                typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    const permission = await DeviceOrientationEvent.requestPermission();
                    if (permission === 'granted') {
                        if (window.Menu) {
                            window.Menu.showNotification('Accelerometer access granted!', 'success');
                        }
                        if (window.Game && window.Game.setupIOSAccelerometer) {
                            window.Game.setupIOSAccelerometer();
                        }
                    } else {
                        if (window.Menu) {
                            window.Menu.showNotification('Accelerometer access denied', 'error');
                        }
                    }
                } catch (error) {
                    console.error('Error requesting accelerometer permission:', error);
                    if (window.Menu) {
                        window.Menu.showNotification('Failed to request access', 'error');
                    }
                }
            } else {
                if (window.Menu) {
                    window.Menu.showNotification('Accelerometer already available', 'info');
                }
            }
        }
        
        setupMutationObserver() {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes.length) {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1) {
                                // Oznacz nowe przyciski
                                if (node.tagName === 'BUTTON') {
                                    node._singleTapProcessed = false;
                                }
                                node.querySelectorAll?.('button').forEach(btn => {
                                    btn._singleTapProcessed = false;
                                });
                            }
                        });
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        
        initializeSpecialElements() {
            // Inicjalizacja sliderów
            document.querySelectorAll('input[type="checkbox"]').forEach(slider => {
                if (!slider._singleTapProcessed) {
                    slider._singleTapProcessed = true;
                }
            });
        }
    }
    
    // Inicjalizacja systemu
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            window.SingleTap = new SingleTapSystem();
            console.log('Single Tap System ready');
        }, 1000);
    });
    
    // Eksport dla debugowania
    console.log('Single Tap Event System loaded');
})();
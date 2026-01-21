// standalone-fix.js - Kompletna naprawa dla iOS PWA
(function() {
    'use strict';
    
    console.log('Loading standalone fix for iOS...');
    
    // Globalne zmienne
    window.isStandalone = window.navigator.standalone || 
                         (window.matchMedia('(display-mode: standalone)').matches) ||
                         (document.referrer.includes('android-app://'));
    
    // Funkcja inicjalizująca
    function initStandaloneFix() {
        if (!window.isStandalone) {
            console.log('Not in standalone mode, skipping fix');
            return;
        }
        
        console.log('Initializing standalone fix for iOS...');
        
        // Dodaj klasę do body
        document.body.classList.add('standalone');
        
        // 1. Napraw wszystkie przyciski - COMPLETE REWRITE
        fixAllButtons();
        
        // 2. Napraw slidery (input type="checkbox")
        fixSliders();
        
        // 3. Napraw dynamiczne przyciski
        setupDynamicButtonObserver();
        
        // 4. Globalny event delegation
        setupGlobalEventDelegation();
        
        // 5. Touch event handling
        setupTouchEvents();
        
        console.log('Standalone fix initialized');
    }
    
    // 1. NAPRAW WSZYSTKIE PRZYCISKI
    function fixAllButtons() {
        console.log('Fixing all buttons for standalone...');
        
        // Usuń wszystkie stare event listeners
        document.querySelectorAll('button').forEach(button => {
            // Zapisz oryginalny onclick
            const originalOnClick = button.onclick;
            
            // Klonuj przycisk
            const newButton = button.cloneNode(true);
            
            // Przywróć onclick jeśli istnieje
            if (originalOnClick) {
                newButton.onclick = originalOnClick;
            }
            
            // Dodaj nasz event listener
            newButton.addEventListener('click', function(e) {
                handleButtonClick(this, e);
            });
            
            // Dodaj touch event
            newButton.addEventListener('touchstart', function(e) {
                handleButtonTouch(this, e);
            }, { passive: true });
            
            // Zamień przycisk
            button.parentNode.replaceChild(newButton, button);
        });
        
        // Również dla linków które działają jak przyciski
        document.querySelectorAll('a[role="button"], .btn').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Link button clicked:', this.textContent);
            });
        });
    }
    
    // 2. NAPRAW SLIDERY
    function fixSliders() {
        console.log('Fixing sliders for standalone...');
        
        document.querySelectorAll('input[type="checkbox"].switch-input').forEach(slider => {
            // Usuń stare event listeners
            const newSlider = slider.cloneNode(true);
            const parent = slider.parentNode;
            
            // Dodaj event listener dla zmiany
            newSlider.addEventListener('change', function(e) {
                console.log('Slider changed:', this.id, this.checked);
                handleSliderChange(this);
            });
            
            // Dodaj click event dla całego switcher
            const switchContainer = parent.closest('.switch');
            if (switchContainer) {
                switchContainer.addEventListener('click', function(e) {
                    if (e.target !== newSlider) {
                        e.preventDefault();
                        e.stopPropagation();
                        newSlider.checked = !newSlider.checked;
                        newSlider.dispatchEvent(new Event('change'));
                    }
                });
            }
            
            parent.replaceChild(newSlider, slider);
        });
    }
    
    // 3. OBSERWATOR DYNAMICZNYCH PRZYCISKÓW
    function setupDynamicButtonObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            // Sprawdź czy dodano przyciski
                            if (node.tagName === 'BUTTON') {
                                fixButton(node);
                            } else {
                                node.querySelectorAll('button').forEach(fixButton);
                                node.querySelectorAll('input[type="checkbox"]').forEach(fixSlider);
                            }
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
    
    // 4. GLOBALNY EVENT DELEGATION
    function setupGlobalEventDelegation() {
        console.log('Setting up global event delegation...');
        
        document.addEventListener('click', function(e) {
            if (!window.isStandalone) return;
            
            const target = e.target;
            
            // Dla przycisków
            const button = target.closest('button');
            if (button) {
                e.preventDefault();
                e.stopPropagation();
                
                setTimeout(() => {
                    processButtonClick(button);
                }, 50);
                return;
            }
            
            // Dla sliderów
            const slider = target.closest('input[type="checkbox"]');
            if (slider) {
                // Pozwól domyślną akcję, ale dodaj delay
                setTimeout(() => {
                    handleSliderChange(slider);
                }, 100);
                return;
            }
        }, true);
    }
    
    // 5. TOUCH EVENT HANDLING
    function setupTouchEvents() {
        document.addEventListener('touchstart', function(e) {
            if (!window.isStandalone) return;
            
            const target = e.target;
            const button = target.closest('button');
            
            if (button) {
                // Dodaj efekt wizualny
                button.style.opacity = '0.7';
                setTimeout(() => {
                    button.style.opacity = '';
                }, 200);
            }
        }, { passive: true });
        
        document.addEventListener('touchend', function(e) {
            if (!window.isStandalone) return;
            
            const target = e.target;
            const button = target.closest('button');
            
            if (button) {
                button.style.opacity = '';
            }
        }, { passive: true });
    }
    
    // HANDLER PRZYCISKÓW
    function handleButtonClick(button, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        console.log('Button clicked:', {
            id: button.id,
            class: button.className,
            text: button.textContent.trim()
        });
        
        processButtonClick(button);
    }
    
    function handleButtonTouch(button, event) {
        event.preventDefault();
        event.stopPropagation();
        
        // Symuluj kliknięcie
        setTimeout(() => {
            processButtonClick(button);
        }, 100);
    }
    
    // GŁÓWNA FUNKCJA OBSŁUGI PRZYCISKÓW
    function processButtonClick(button) {
        const buttonId = button.id;
        const buttonClass = button.className;
        
        console.log('Processing button:', buttonId, buttonClass);
        
        // 1. PRZYCISKI MENU GŁÓWNEGO
        if (buttonId === 'play-btn') {
            console.log('PLAY button clicked');
            if (window.Menu && window.Menu.startGame) {
                window.Menu.startGame();
            }
            return;
        }
        
        if (buttonId === 'balls-btn') {
            console.log('BALLS button clicked');
            if (window.Menu && window.Menu.switchScreen) {
                window.Menu.switchScreen('balls');
            }
            return;
        }
        
        if (buttonId === 'upgrades-btn') {
            console.log('UPGRADES button clicked');
            if (window.Menu && window.Menu.switchScreen) {
                window.Menu.switchScreen('upgrades');
            }
            return;
        }
        
        if (buttonId === 'settings-btn') {
            console.log('SETTINGS button clicked');
            if (window.Menu && window.Menu.switchScreen) {
                window.Menu.switchScreen('settings');
            }
            return;
        }
        
        // 2. PRZYCISKI PAUZY
        if (buttonId === 'pause-btn') {
            console.log('PAUSE button clicked');
            if (window.Menu && window.Menu.togglePause) {
                window.Menu.togglePause();
            }
            return;
        }
        
        if (buttonId === 'resume-btn') {
            console.log('RESUME button clicked');
            if (window.Menu && window.Menu.togglePause) {
                window.Menu.togglePause();
            }
            return;
        }
        
        if (buttonId === 'restart-btn') {
            console.log('RESTART button clicked');
            if (window.Menu) {
                window.Menu.saveGameProgress(true);
                window.Menu.state.coinsInGame = 0;
                const pauseMenu = document.getElementById('pause-menu');
                if (pauseMenu) pauseMenu.classList.add('hidden');
                window.Menu.startGame();
            }
            return;
        }
        
        if (buttonId === 'quit-to-menu-btn') {
            console.log('QUIT TO MENU button clicked');
            if (window.Menu) {
                window.Menu.saveGameProgress(true);
                window.Menu.state.coinsInGame = 0;
                const pauseMenu = document.getElementById('pause-menu');
                if (pauseMenu) pauseMenu.classList.add('hidden');
                window.Menu.switchScreen('start');
            }
            return;
        }
        
        // 3. PRZYCISKI GAME OVER
        if (buttonId === 'play-again-btn') {
            console.log('PLAY AGAIN button clicked');
            if (window.Menu) {
                window.Menu.saveGameProgress(false);
                window.Menu.state.coinsInGame = 0;
                const gameOverScreen = document.getElementById('game-over-screen');
                if (gameOverScreen) gameOverScreen.classList.add('hidden');
                window.Menu.startGame();
            }
            return;
        }
        
        if (buttonId === 'quit-after-game-btn') {
            console.log('QUIT AFTER GAME button clicked');
            const gameOverScreen = document.getElementById('game-over-screen');
            if (gameOverScreen) gameOverScreen.classList.add('hidden');
            if (window.Menu && window.Menu.switchScreen) {
                window.Menu.switchScreen('start');
            }
            return;
        }
        
        // 4. PRZYCISKI EKRANU PIŁEK
        if (buttonClass.includes('select-ball-btn')) {
            console.log('SELECT BALL button clicked');
            const ballCard = button.closest('.ball-card');
            if (ballCard && window.Menu && window.Menu.selectBall) {
                const ballType = ballCard.dataset.ball;
                window.Menu.selectBall(ballType);
            }
            return;
        }
        
        if (buttonClass.includes('unlock-btn')) {
            console.log('UNLOCK BALL button clicked');
            const ballCard = button.closest('.ball-card');
            if (ballCard && window.Menu && window.Menu.unlockBall) {
                const ballType = ballCard.dataset.ball;
                window.Menu.unlockBall(ballType);
            }
            return;
        }
        
        // 5. PRZYCISKI ULEPSZEŃ
        if (buttonClass.includes('buy-btn') && !button.disabled) {
            console.log('BUY UPGRADE button clicked');
            const upgradeItem = button.closest('.upgrade-item');
            if (upgradeItem && window.Menu && window.Menu.buyUpgrade) {
                // Szukamy upgradeId
                const upgradeName = upgradeItem.querySelector('h4')?.textContent;
                if (upgradeName) {
                    const ballType = window.Menu.state.currentBall;
                    // Musimy znaleźć upgradeId po nazwie
                    const upgradeDefs = GameConfig.getUpgradeDefinitions(ballType);
                    const upgradeDef = upgradeDefs.find(u => 
                        upgradeName.includes(u.name.split(' ')[0]) // Uproszczone dopasowanie
                    );
                    if (upgradeDef) {
                        window.Menu.buyUpgrade(ballType, upgradeDef.id);
                    }
                }
            }
            return;
        }
        
        if (buttonClass.includes('toggle-btn')) {
            console.log('TOGGLE UPGRADE button clicked');
            const upgradeItem = button.closest('.upgrade-item');
            if (upgradeItem && window.Menu && window.Menu.toggleUpgrade) {
                const upgradeName = upgradeItem.querySelector('h4')?.textContent;
                if (upgradeName) {
                    const ballType = window.Menu.state.currentBall;
                    const upgradeDefs = GameConfig.getUpgradeDefinitions(ballType);
                    const upgradeDef = upgradeDefs.find(u => 
                        upgradeName.includes(u.name.split(' ')[0])
                    );
                    if (upgradeDef) {
                        window.Menu.toggleUpgrade(ballType, upgradeDef.id);
                    }
                }
            }
            return;
        }
        
        // 6. PRZYCISKI USTAWIEN
        if (buttonId === 'add-coins-btn') {
            console.log('ADD COINS button clicked');
            if (window.Menu) {
                window.Menu.state.totalCoins += 1000;
                window.Menu.saveData();
                window.Menu.updateCoinsDisplay();
                window.Menu.showNotification('Added 1000 coins!', 'success');
            }
            return;
        }
        
        if (buttonId === 'reset-progress-btn') {
            console.log('RESET PROGRESS button clicked');
            if (window.Menu && confirm('Are you sure you want to reset all progress?')) {
                window.Menu.resetData();
                window.Menu.updateMainMenu();
                window.Menu.showNotification('All data has been reset', 'warning');
            }
            return;
        }
        
        if (buttonId === 'request-accelerometer-btn') {
            console.log('REQUEST ACCELEROMETER button clicked');
            requestAccelerometerAccess();
            return;
        }
        
        // 7. PRZYCISKI POWROTU
        if (buttonClass.includes('back-btn')) {
            console.log('BACK button clicked');
            if (window.Menu && window.Menu.switchScreen) {
                window.Menu.switchScreen('start');
            }
            return;
        }
        
        console.warn('Unhandled button click:', buttonId, buttonClass);
    }
    
    // HANDLER SLIDERÓW
    function handleSliderChange(slider) {
        console.log('Slider changed:', slider.id, slider.checked);
        
        if (!window.Menu) return;
        
        // Mapowanie sliderów do ustawień
        const settingMap = {
            'auto-jump-toggle': 'autoJump',
            'mobile-controls-toggle': 'mobileControls', 
            'accelerometer-toggle': 'accelerometer',
            'wind-display-toggle': 'windDisplay',
            'debug-info-toggle': 'debugInfo'
        };
        
        const settingKey = settingMap[slider.id];
        if (settingKey) {
            window.Menu.state.settings[settingKey] = slider.checked;
            window.Menu.saveData();
            window.Menu.applySettings();
            
            // Aktualizuj Game jeśli istnieje
            if (window.Game && window.Game.applySettings) {
                window.Game.applySettings();
            }
        }
    }
    
    // FUNKCJA POMOCNICZA DLA ACCELEROMETER
    async function requestAccelerometerAccess() {
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
    
    // FUNKCJE POMOCNICZE
    function fixButton(button) {
        if (button._standaloneFixed) return;
        
        button.addEventListener('click', function(e) {
            handleButtonClick(this, e);
        });
        
        button.addEventListener('touchstart', function(e) {
            handleButtonTouch(this, e);
        }, { passive: true });
        
        button._standaloneFixed = true;
    }
    
    function fixSlider(slider) {
        if (slider._standaloneFixed) return;
        
        slider.addEventListener('change', function() {
            handleSliderChange(this);
        });
        
        slider._standaloneFixed = true;
    }
    
    // INICJALIZACJA
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initStandaloneFix, 500);
    });
    
    // Eksport dla debugowania
    window.StandaloneFix = {
        reinit: initStandaloneFix,
        isStandalone: window.isStandalone,
        fixAllButtons: fixAllButtons,
        fixSliders: fixSliders
    };
    
    console.log('Standalone fix module loaded');
})();
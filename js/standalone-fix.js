// standalone-fix.js - Single Source of Truth dla eventów w standalone
(function() {
    'use strict';
    
    console.log('Loading standalone fix for iOS...');
    
    // Globalne zmienne
    const isStandalone = window.navigator.standalone || 
                       (window.matchMedia('(display-mode: standalone)').matches);
    
    if (!isStandalone) {
        console.log('Not in standalone mode, skipping fix');
        return;
    }
    
    console.log('STANDALONE MODE DETECTED - applying single source event handling');
    
    // Flaga aby zapobiec wielokrotnemu kliknięciu
    let isProcessingClick = false;
    let lastProcessedButton = null;
    let lastProcessTime = 0;
    
    // Dodaj klasę do body
    document.body.classList.add('standalone');
    
    // USUŃ WSZYSTKIE ISTNIEJĄCE EVENT LISTENERY Z PRZYCISKÓW
    function removeAllButtonListeners() {
        console.log('Removing all existing button listeners...');
        
        document.querySelectorAll('button').forEach(button => {
            // Klonuj przycisk - to usuwa WSZYSTKIE event listeners
            const newButton = button.cloneNode(true);
            
            // Usuń atrybut onclick
            newButton.removeAttribute('onclick');
            
            // Usuń wszystkie event listeners przez zastąpienie
            const oldParent = button.parentNode;
            if (oldParent) {
                oldParent.replaceChild(newButton, button);
            }
            
            // Oznacz jako naprawiony
            newButton.dataset.standaloneFixed = 'true';
        });
    }
    
    // USUŃ EVENT LISTENERY Z SLIDERÓW
    function removeSliderListeners() {
        console.log('Removing all existing slider listeners...');
        
        document.querySelectorAll('input[type="checkbox"]').forEach(slider => {
            const newSlider = slider.cloneNode(true);
            const parent = slider.parentNode;
            if (parent) {
                parent.replaceChild(newSlider, slider);
            }
        });
    }
    
    // SINGLE SOURCE EVENT HANDLER - JEDYNE MIEJSCE GDZIE OBSŁUGUJEMY KLIKNIĘCIA
    function setupSingleSourceEventHandling() {
        console.log('Setting up SINGLE SOURCE event handling...');
        
        // 1. Usuń WSZYSTKIE istniejące event listeners
        removeAllButtonListeners();
        removeSliderListeners();
        
        // 2. GLOBALNY EVENT LISTENER - JEDYNY dla całej aplikacji
        document.addEventListener('click', function(e) {
            // Zapobiegaj domyślnym akcjom
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Zapobiegaj wielokrotnemu przetwarzaniu
            if (isProcessingClick) {
                console.log('Already processing click, ignoring');
                return false;
            }
            
            const target = e.target;
            const now = Date.now();
            
            // Sprawdź czy to ten sam przycisk w krótkim czasie
            if (lastProcessedButton === target && (now - lastProcessTime) < 1000) {
                console.log('Same button clicked too quickly, ignoring');
                return false;
            }
            
            // Ustaw flagę przetwarzania
            isProcessingClick = true;
            lastProcessedButton = target;
            lastProcessTime = now;
            
            // Obsłuż kliknięcie z opóźnieniem
            setTimeout(() => {
                try {
                    handleSingleClick(target);
                } catch (error) {
                    console.error('Error handling click:', error);
                } finally {
                    // Reset flagi
                    setTimeout(() => {
                        isProcessingClick = false;
                    }, 100);
                }
            }, 50);
            
            return false;
        }, true); // Użyj capture phase aby przechwycić WSZYSTKIE kliknięcia
        
        // 3. TOUCH EVENTS - przekieruj do click
        document.addEventListener('touchstart', function(e) {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                
                if (target) {
                    // Symuluj kliknięcie
                    const clickEvent = new MouseEvent('click', {
                        view: window,
                        bubbles: true,
                        cancelable: true
                    });
                    target.dispatchEvent(clickEvent);
                }
            }
            e.preventDefault();
        }, { passive: false });
        
        // 4. KEYBOARD EVENTS - tylko dla pauzy
        document.addEventListener('keydown', function(e) {
            if (e.key === 'p' || e.key === 'P') {
                e.preventDefault();
                e.stopPropagation();
                
                if (!isProcessingClick) {
                    isProcessingClick = true;
                    setTimeout(() => {
                        if (window.Menu && window.Menu.togglePause) {
                            window.Menu.togglePause();
                        }
                        isProcessingClick = false;
                    }, 50);
                }
            }
        }, true);
    }
    
    // GŁÓWNA FUNKCJA OBSŁUGUJĄCA JEDNO KLIKNIĘCIE
    function handleSingleClick(target) {
        console.log('SINGLE SOURCE handling click for:', target.tagName, target.id, target.className);
        
        // 1. Sprawdź czy to przycisk
        const button = target.closest('button');
        if (button && !button.disabled) {
            console.log('Button clicked:', button.id, button.className);
            processButtonClick(button);
            return;
        }
        
        // 2. Sprawdź czy to slider
        const slider = target.closest('input[type="checkbox"]');
        if (slider) {
            console.log('Slider toggled:', slider.id, slider.checked);
            processSliderChange(slider);
            return;
        }
        
        // 3. Sprawdź czy to label dla slidera
        const label = target.closest('label');
        if (label && label.classList.contains('switch')) {
            const slider = label.querySelector('input[type="checkbox"]');
            if (slider) {
                slider.checked = !slider.checked;
                console.log('Slider label clicked, toggling:', slider.id, slider.checked);
                processSliderChange(slider);
            }
            return;
        }
        
        // 4. Sprawdź czy to element z klasą clickable
        if (target.classList.contains('hud-btn') || 
            target.classList.contains('menu-btn') || 
            target.classList.contains('back-btn')) {
            console.log('Clickable element clicked:', target.className);
            
            // Znajdź najbliższy przycisk
            const button = target.closest('button');
            if (button && !button.disabled) {
                processButtonClick(button);
            }
            return;
        }
        
        console.log('Unhandled click target:', target);
    }
    
    // OBSŁUGA PRZYCISKÓW
    function processButtonClick(button) {
        const buttonId = button.id;
        const buttonClass = button.className;
        
        console.log('PROCESSING button:', buttonId || 'no id', buttonClass);
        
        // Mapowanie przycisków do akcji
        const buttonHandlers = {
            // MENU GŁÓWNE
            'play-btn': () => {
                console.log('→ Play button');
                if (window.Menu && window.Menu.startGame) {
                    window.Menu.startGame();
                }
            },
            'balls-btn': () => {
                console.log('→ Balls button');
                if (window.Menu && window.Menu.switchScreen) {
                    window.Menu.switchScreen('balls');
                }
            },
            'upgrades-btn': () => {
                console.log('→ Upgrades button');
                if (window.Menu && window.Menu.switchScreen) {
                    window.Menu.switchScreen('upgrades');
                }
            },
            'settings-btn': () => {
                console.log('→ Settings button');
                if (window.Menu && window.Menu.switchScreen) {
                    window.Menu.switchScreen('settings');
                }
            },
            
            // PAUZA
            'pause-btn': () => {
                console.log('→ Pause button');
                if (window.Menu && window.Menu.togglePause) {
                    window.Menu.togglePause();
                }
            },
            'resume-btn': () => {
                console.log('→ Resume button');
                if (window.Menu && window.Menu.togglePause) {
                    window.Menu.togglePause();
                }
            },
            'restart-btn': () => {
                console.log('→ Restart button');
                if (window.Menu) {
                    window.Menu.saveGameProgress(true);
                    window.Menu.state.coinsInGame = 0;
                    const pauseMenu = document.getElementById('pause-menu');
                    if (pauseMenu) pauseMenu.classList.add('hidden');
                    window.Menu.startGame();
                }
            },
            'quit-to-menu-btn': () => {
                console.log('→ Quit to menu button');
                if (window.Menu) {
                    window.Menu.saveGameProgress(true);
                    window.Menu.state.coinsInGame = 0;
                    const pauseMenu = document.getElementById('pause-menu');
                    if (pauseMenu) pauseMenu.classList.add('hidden');
                    window.Menu.switchScreen('start');
                }
            },
            
            // GAME OVER
            'play-again-btn': () => {
                console.log('→ Play again button');
                if (window.Menu) {
                    window.Menu.saveGameProgress(false);
                    window.Menu.state.coinsInGame = 0;
                    const gameOverScreen = document.getElementById('game-over-screen');
                    if (gameOverScreen) gameOverScreen.classList.add('hidden');
                    window.Menu.startGame();
                }
            },
            'quit-after-game-btn': () => {
                console.log('→ Quit after game button');
                const gameOverScreen = document.getElementById('game-over-screen');
                if (gameOverScreen) gameOverScreen.classList.add('hidden');
                if (window.Menu && window.Menu.switchScreen) {
                    window.Menu.switchScreen('start');
                }
            },
            
            // USTAWIENIA
            'add-coins-btn': () => {
                console.log('→ Add coins button');
                if (window.Menu) {
                    window.Menu.state.totalCoins += 1000;
                    window.Menu.saveData();
                    window.Menu.updateCoinsDisplay();
                    window.Menu.showNotification('Added 1000 coins!', 'success');
                }
            },
            'reset-progress-btn': () => {
                console.log('→ Reset progress button');
                if (window.Menu) {
                    // Użyj własnego prompt zamiast confirm
                    showConfirmDialog(
                        'Reset Progress',
                        'Are you sure you want to reset all progress? This action cannot be undone.',
                        () => {
                            window.Menu.resetData();
                            window.Menu.updateMainMenu();
                            window.Menu.showNotification('All data has been reset', 'warning');
                        }
                    );
                }
            },
            'request-accelerometer-btn': () => {
                console.log('→ Request accelerometer button');
                requestAccelerometerAccess();
            }
        };
        
        // Sprawdź czy mamy handler dla tego ID przycisku
        if (buttonId && buttonHandlers[buttonId]) {
            buttonHandlers[buttonId]();
            return;
        }
        
        // Obsługa przycisków po klasach
        if (buttonClass.includes('back-btn')) {
            console.log('→ Back button');
            if (window.Menu && window.Menu.switchScreen) {
                window.Menu.switchScreen('start');
            }
            return;
        }
        
        // Przyciski wyboru piłki
        if (buttonClass.includes('select-ball-btn')) {
            console.log('→ Select ball button');
            const ballCard = button.closest('.ball-card');
            if (ballCard && window.Menu && window.Menu.selectBall) {
                const ballType = ballCard.dataset.ball;
                window.Menu.selectBall(ballType);
            }
            return;
        }
        
        // Przyciski odblokowania piłki
        if (buttonClass.includes('unlock-btn')) {
            console.log('→ Unlock ball button');
            const ballCard = button.closest('.ball-card');
            if (ballCard && window.Menu && window.Menu.unlockBall) {
                const ballType = ballCard.dataset.ball;
                window.Menu.unlockBall(ballType);
            }
            return;
        }
        
        // Przyciski zakupu ulepszeń
        if (buttonClass.includes('buy-btn') && !button.disabled) {
            console.log('→ Buy upgrade button');
            const upgradeItem = button.closest('.upgrade-item');
            if (upgradeItem && window.Menu && window.Menu.buyUpgrade) {
                // Pobierz dane z data-atrybutów
                const ballType = button.dataset.ballType || window.Menu.state.currentBall;
                const upgradeId = button.dataset.upgradeId;
                
                if (ballType && upgradeId) {
                    window.Menu.buyUpgrade(ballType, upgradeId);
                } else {
                    console.error('Missing data attributes for upgrade button');
                }
            }
            return;
        }
        
        // Przyciski włączania/wyłączania ulepszeń
        if (buttonClass.includes('toggle-btn')) {
            console.log('→ Toggle upgrade button');
            const upgradeItem = button.closest('.upgrade-item');
            if (upgradeItem && window.Menu && window.Menu.toggleUpgrade) {
                const ballType = button.dataset.ballType || window.Menu.state.currentBall;
                const upgradeId = button.dataset.upgradeId;
                
                if (ballType && upgradeId) {
                    window.Menu.toggleUpgrade(ballType, upgradeId);
                } else {
                    console.error('Missing data attributes for toggle button');
                }
            }
            return;
        }
        
        // Przyciski wyboru piłki do ulepszeń
        if (buttonClass.includes('ball-select-btn') && !buttonClass.includes('active')) {
            console.log('→ Ball select for upgrades button');
            const ballName = button.textContent.trim();
            
            // Znajdź typ piłki
            const ballTypes = ['standard', 'rubber', 'beach', 'golf'];
            for (const ballType of ballTypes) {
                if (GameConfig.getBallDisplayName(ballType) === ballName) {
                    if (window.Menu) {
                        window.Menu.state.currentBall = ballType;
                        window.Menu.updateUpgradesScreen();
                    }
                    break;
                }
            }
            return;
        }
        
        console.warn('Unhandled button:', buttonId, buttonClass);
    }
    
    // OBSŁUGA SLIDERÓW
    function processSliderChange(slider) {
        const settingMap = {
            'auto-jump-toggle': 'autoJump',
            'mobile-controls-toggle': 'mobileControls',
            'accelerometer-toggle': 'accelerometer',
            'wind-display-toggle': 'windDisplay',
            'debug-info-toggle': 'debugInfo'
        };
        
        const settingKey = settingMap[slider.id];
        if (settingKey && window.Menu) {
            // Zaktualizuj stan w Menu
            window.Menu.state.settings[settingKey] = slider.checked;
            window.Menu.saveData();
            window.Menu.applySettings();
            
            // Aktualizuj Game
            if (window.Game && window.Game.applySettings) {
                window.Game.applySettings();
            }
            
            console.log('Setting updated:', settingKey, slider.checked);
        }
    }
    
    // WŁASNE OKNO POTWIERDZENIA (zamiast confirm)
    function showConfirmDialog(title, message, onConfirm) {
        // Stwórz modal
        const modal = document.createElement('div');
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
            z-index: 10000;
            font-family: 'Roboto', sans-serif;
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
                <h3 style="
                    color: #fff;
                    margin-bottom: 15px;
                    font-family: 'Orbitron', sans-serif;
                ">${title}</h3>
                <p style="
                    color: #aaa;
                    margin-bottom: 25px;
                    line-height: 1.5;
                ">${message}</p>
                <div style="display: flex; gap: 15px;">
                    <button id="confirm-cancel" style="
                        flex: 1;
                        padding: 12px;
                        background: rgba(255,107,107,0.2);
                        border: 2px solid rgba(255,107,107,0.3);
                        border-radius: 12px;
                        color: white;
                        font-size: 16px;
                        cursor: pointer;
                    ">Cancel</button>
                    <button id="confirm-ok" style="
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
        
        // Event listeners dla przycisków
        modal.querySelector('#confirm-cancel').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('#confirm-ok').addEventListener('click', () => {
            document.body.removeChild(modal);
            if (onConfirm) onConfirm();
        });
    }
    
    // ACCELEROMETER ACCESS
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
    
    // OBSERWATOR DLA DYNAMICZNYCH ELEMENTÓW
    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            // Sprawdź czy dodano przyciski
                            if (node.tagName === 'BUTTON') {
                                node.dataset.standaloneFixed = 'false';
                            } else {
                                node.querySelectorAll('button').forEach(btn => {
                                    btn.dataset.standaloneFixed = 'false';
                                });
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
    
    // INICJALIZACJA
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            console.log('Initializing SINGLE SOURCE event handling...');
            
            // 1. Ustaw single source event handling
            setupSingleSourceEventHandling();
            
            // 2. Ustaw obserwatora mutacji
            setupMutationObserver();
            
            // 3. Dodaj style dla standalone
            addStandaloneStyles();
            
            console.log('Single source event handling initialized');
        }, 1000);
    });
    
    // DODAJ STYLE DLA STANDALONE
    function addStandaloneStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Zapobieganie podwójnym kliknięciom */
            body.standalone button[data-standalone-processed="true"] {
                pointer-events: none;
                opacity: 0.7;
            }
            
            /* Feedback dla kliknięć */
            body.standalone button:active {
                transform: scale(0.95);
                transition: transform 0.1s;
            }
            
            /* Większe obszary dotykowe */
            body.standalone button,
            body.standalone .switch {
                min-height: 44px;
                min-width: 44px;
            }
            
            /* Ukryj domyślne podświetlenie */
            body.standalone * {
                -webkit-tap-highlight-color: transparent;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Eksport dla debugowania
    window.StandaloneFix = {
        reinit: () => {
            removeAllButtonListeners();
            setupSingleSourceEventHandling();
        },
        isStandalone: true
    };
    
    console.log('SINGLE SOURCE standalone fix loaded');
})();
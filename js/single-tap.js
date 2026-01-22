// single-tap.js - Poprawiona wersja dla standalone iOS
(function() {
    'use strict';

    console.log('Loading Single Tap System...');

    // Sprawdź, czy jesteśmy w trybie standalone
    const isStandalone = window.navigator.standalone || 
                        window.matchMedia('(display-mode: standalone)').matches;

    // TYLKO dla standalone używamy tego systemu
    if (!isStandalone) {
        console.log('Browser mode - Single Tap System disabled');
        return;
    }

    console.log('Standalone mode detected - activating Single Tap System');
    document.body.classList.add('standalone');

    // Flagi zapobiegające duplikacji
    let isProcessing = false;
    let lastProcessedId = null;
    let lastProcessTime = 0;

    // 1. USUŃ WSZYSTKIE ISTNIEJĄCE ONCLICK ATTRYBUTY (tylko w standalone)
    function removeOnClickAttributes() {
        console.log('Removing onclick attributes for standalone...');

        document.querySelectorAll('[onclick]').forEach(element => {
            const originalOnClick = element.getAttribute('onclick');
            element.removeAttribute('onclick');
            element.dataset.originalOnclick = originalOnClick;
        });
    }

    // 2. GLOBALNY CLICK HANDLER dla standalone
    function setupGlobalClickHandler() {
        console.log('Setting up global click handler for standalone...');

        // Używamy capture phase aby przechwycić WSZYSTKIE kliknięcia
        document.addEventListener('click', function(e) {
            const target = e.target;
            
            // 1. IGNORUJ kliknięcia w CANVAS i elementy gry
            if (target.closest('#game-canvas') || 
                target.closest('#game-screen') ||
                target.closest('#mobile-controls-overlay')) {
                console.log('Game area click - allowing default behavior');
                return; // Pozwól normalne działanie
            }

            // 2. IGNORUJ kliknięcia w custom modal (ale nie przyciski w nim)
            if (target.closest('.custom-confirm-modal')) {
                // Pozwól na normalne działanie przycisków w modal
                // Ale zapobiegaj kliknięciu w tło (zamknięcie)
                if (!target.closest('.custom-confirm-modal > div') && 
                    !target.closest('.custom-confirm-modal button')) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                return;
            }

            // 3. Zapobiegaj duplikacji dla przycisków UI
            if (isProcessing) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            const button = target.closest('button');
            const now = Date.now();

            // Jeśli to przycisk
            if (button && !button.disabled) {
                const buttonId = button.id || button.className;

                // Sprawdź czy to nie jest szybkie ponowne kliknięcie tego samego przycisku
                if (lastProcessedId === buttonId && (now - lastProcessTime) < 500) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Duplicate click prevented for:', buttonId);
                    return;
                }

                // Ustaw flagi
                isProcessing = true;
                lastProcessedId = buttonId;
                lastProcessTime = now;

                // Obsłuż kliknięcie z opóźnieniem
                setTimeout(() => {
                    handleButtonClick(button);

                    // Reset flagi
                    setTimeout(() => {
                        isProcessing = false;
                    }, 100);
                }, 10);

                e.preventDefault();
                e.stopPropagation();
                return;
            }

            // Obsługa sliderów
            const slider = target.closest('input[type="checkbox"]');
            if (slider) {
                // Pozwól sliderowi działać normalnie, ale dodaj delay dla zmiany
                setTimeout(() => {
                    handleSliderChange(slider);
                }, 100);
                return; // Pozwól domyślne działanie slidera
            }

            // Jeśli to label dla slidera
            const label = target.closest('label.switch');
            if (label) {
                const slider = label.querySelector('input[type="checkbox"]');
                if (slider) {
                    setTimeout(() => {
                        slider.checked = !slider.checked;
                        handleSliderChange(slider);
                    }, 50);
                }
                return;
            }

        }, true); // Użyj capture phase

        // Touch events - przekieruj do click
        document.addEventListener('touchstart', function(e) {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const target = document.elementFromPoint(touch.clientX, touch.clientY);

                if (target && (target.tagName === 'BUTTON' || 
                              target.closest('button') || 
                              target.closest('input[type="checkbox"]') ||
                              target.closest('label.switch'))) {
                    e.preventDefault();

                    // Symuluj kliknięcie
                    const clickEvent = new MouseEvent('click', {
                        view: window,
                        bubbles: true,
                        cancelable: true
                    });
                    target.dispatchEvent(clickEvent);
                }
            }
        }, { passive: false });
    }

    // 3. OBSŁUGA PRZYCISKÓW
    function handleButtonClick(button) {
        const buttonId = button.id;
        const buttonClass = button.className;

        console.log('Processing button click in standalone:', buttonId, buttonClass);

        // Mapowanie przycisków do funkcji Menu
        const actionMap = {
            // MENU GŁÓWNE
            'play-btn': () => callMenuFunction('startGame'),
            'balls-btn': () => callMenuFunction('switchScreen', 'balls'),
            'upgrades-btn': () => callMenuFunction('switchScreen', 'upgrades'),
            'settings-btn': () => callMenuFunction('switchScreen', 'settings'),

            // PAUZA
            'pause-btn': () => callMenuFunction('togglePause'),
            'resume-btn': () => callMenuFunction('togglePause'),
            'restart-btn': () => restartGame(),
            'quit-to-menu-btn': () => quitToMenu(),

            // GAME OVER
            'play-again-btn': () => playAgain(),
            'quit-after-game-btn': () => callMenuFunction('switchScreen', 'start'),

            // USTAWIENIA
            'add-coins-btn': () => addCoins(),
            'reset-progress-btn': () => showResetConfirm(),
            'request-accelerometer-btn': () => requestAccelerometerAccess(),

            // BACK BUTTONS (używamy klasy, bo może być wiele przycisków z tą klasą)
            'back-btn': () => callMenuFunction('switchScreen', 'start')
        };

        // Sprawdź po ID
        if (buttonId && actionMap[buttonId]) {
            actionMap[buttonId]();
            return;
        }

        // Sprawdź po klasie (dla przycisków, które nie mają unikalnego ID)
        if (buttonClass.includes('back-btn')) {
            callMenuFunction('switchScreen', 'start');
            return;
        }

        if (buttonClass.includes('select-ball-btn')) {
            const ballCard = button.closest('.ball-card');
            if (ballCard) {
                const ballType = ballCard.dataset.ball;
                callMenuFunction('selectBall', ballType);
            }
            return;
        }

        if (buttonClass.includes('unlock-btn')) {
            const ballCard = button.closest('.ball-card');
            if (ballCard) {
                const ballType = ballCard.dataset.ball;
                callMenuFunction('unlockBall', ballType);
            }
            return;
        }

        if (buttonClass.includes('buy-btn') && !button.disabled) {
            const upgradeItem = button.closest('.upgrade-item');
            if (upgradeItem) {
                const ballType = window.Menu?.state?.currentBall || 'standard';
                const upgradeName = upgradeItem.querySelector('h4')?.textContent;
                if (upgradeName) {
                    // Musimy znaleźć upgradeId
                    const upgradeDefs = GameConfig.getUpgradeDefinitions(ballType);
                    const upgradeDef = upgradeDefs.find(u => 
                        upgradeName.includes(u.name.split(' ')[0])
                    );
                    if (upgradeDef && window.Menu?.buyUpgrade) {
                        window.Menu.buyUpgrade(ballType, upgradeDef.id);
                    }
                }
            }
            return;
        }

        if (buttonClass.includes('toggle-btn')) {
            const upgradeItem = button.closest('.upgrade-item');
            if (upgradeItem) {
                const ballType = window.Menu?.state?.currentBall || 'standard';
                const upgradeName = upgradeItem.querySelector('h4')?.textContent;
                if (upgradeName) {
                    const upgradeDefs = GameConfig.getUpgradeDefinitions(ballType);
                    const upgradeDef = upgradeDefs.find(u => 
                        upgradeName.includes(u.name.split(' ')[0])
                    );
                    if (upgradeDef && window.Menu?.toggleUpgrade) {
                        window.Menu.toggleUpgrade(ballType, upgradeDef.id);
                    }
                }
            }
            return;
        }

        if (buttonClass.includes('ball-select-btn') && !buttonClass.includes('active')) {
            const ballName = button.textContent.trim();
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
    }

    // 4. POMOCNICZE FUNKCJE
    function callMenuFunction(funcName, param = null) {
        if (!window.Menu || !window.Menu[funcName]) {
            console.error('Menu or function not available:', funcName);
            return;
        }

        console.log('Calling Menu function:', funcName, param);

        if (param !== null) {
            window.Menu[funcName](param);
        } else {
            window.Menu[funcName]();
        }
    }

    function addCoins() {
        if (window.Menu) {
            window.Menu.state.totalCoins += 1000;
            window.Menu.saveData();
            window.Menu.updateCoinsDisplay();
            window.Menu.showNotification('Added 1000 coins!', 'success');
        }
    }

    function showResetConfirm() {
        // Stwórz custom modal
        const modal = document.createElement('div');
        modal.className = 'custom-confirm-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
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
                    font-size: 20px;
                ">Reset Progress</h3>
                <p style="
                    color: #aaa;
                    margin-bottom: 25px;
                    line-height: 1.5;
                    font-size: 16px;
                ">Are you sure you want to reset all progress? This action cannot be undone.</p>
                <div style="display: flex; gap: 15px;">
                    <button id="modal-cancel-btn" style="
                        flex: 1;
                        padding: 15px;
                        background: rgba(255,107,107,0.2);
                        border: 2px solid rgba(255,107,107,0.3);
                        border-radius: 12px;
                        color: white;
                        font-size: 16px;
                        font-weight: 500;
                        cursor: pointer;
                        min-height: 50px;
                    ">Cancel</button>
                    <button id="modal-ok-btn" style="
                        flex: 1;
                        padding: 15px;
                        background: linear-gradient(135deg, rgba(74,159,255,0.2), rgba(74,255,74,0.1));
                        border: 2px solid rgba(74,159,255,0.3);
                        border-radius: 12px;
                        color: white;
                        font-size: 16px;
                        font-weight: 500;
                        cursor: pointer;
                        min-height: 50px;
                    ">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Dodaj event listeners dla przycisków w modal
        const cancelBtn = document.getElementById('modal-cancel-btn');
        const okBtn = document.getElementById('modal-ok-btn');

        function closeModal() {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }

        cancelBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeModal();
        });

        okBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeModal();
            if (window.Menu) {
                window.Menu.resetData();
                window.Menu.updateMainMenu();
                window.Menu.showNotification('All data has been reset', 'warning');
            }
        });

        // Zamknij modal przy kliknięciu w tło
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    function restartGame() {
        if (window.Menu) {
            window.Menu.saveGameProgress(true);
            window.Menu.state.coinsInGame = 0;
            const pauseMenu = document.getElementById('pause-menu');
            if (pauseMenu) pauseMenu.classList.add('hidden');
            window.Menu.startGame();
        }
    }

    function quitToMenu() {
        if (window.Menu) {
            window.Menu.saveGameProgress(true);
            window.Menu.state.coinsInGame = 0;
            const pauseMenu = document.getElementById('pause-menu');
            if (pauseMenu) pauseMenu.classList.add('hidden');
            window.Menu.switchScreen('start');
        }
    }

    function playAgain() {
        if (window.Menu) {
            window.Menu.saveGameProgress(false);
            window.Menu.state.coinsInGame = 0;
            const gameOverScreen = document.getElementById('game-over-screen');
            if (gameOverScreen) gameOverScreen.classList.add('hidden');
            window.Menu.startGame();
        }
    }

    function handleSliderChange(slider) {
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

            if (window.Game && window.Game.applySettings) {
                window.Game.applySettings();
            }
        }
    }

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

    // 5. INICJALIZACJA
    function init() {
        console.log('Initializing Single Tap System for standalone...');

        // Usuń onclick atrybuty
        removeOnClickAttributes();

        // Ustaw globalny click handler
        setupGlobalClickHandler();

        console.log('Single Tap System initialized');
    }

    // Poczekaj na załadowanie DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 1000);
    }

})();
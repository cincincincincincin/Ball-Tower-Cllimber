
const CANVAS_WIDTH = 430;
const CANVAS_HEIGHT = 932;
const CANVAS_BACKGROUND_COLOR = "#111";


const FPS = 60;


const MOBILE_BREAKPOINT = 768;


const BALL_TYPES = {
    STANDARD: 'standard',
    RUBBER: 'rubber', 
    BEACH: 'beach',
    GOLF: 'golf'
};




const PLAYER_START_X = CANVAS_WIDTH / 2;
const PLAYER_START_Y = CANVAS_HEIGHT - 100;


const WALL_THICKNESS = 10;
const WALL_COLOR = "#333";
const WALL_LEFT_X = 0;
const WALL_RIGHT_X = CANVAS_WIDTH;


const CAMERA_THRESHOLD = 200;


const FLOOR_HEIGHT = 15;
const FLOOR_COLOR = "#666";
const SPECIAL_FLOOR_COLOR = "#a66";
const START_FLOOR_WIDTH = 410;
const FLOOR_MIN_WIDTH = 70;
const FLOOR_MAX_WIDTH = 215;
const FLOOR_VERTICAL_SPACING = 150;
const FLOOR_MAX_HORIZONTAL_GAP = 330;
const FLOOR_MARGIN = 10;
const SPECIAL_FLOOR_INTERVAL = 100;
const SPECIAL_FLOOR_WIDTH = 410;
const FLOORS_TO_GENERATE_AHEAD = 10;
const FLOORS_TO_GENERATE_BEHIND = 10000;
const FLOOR_FADE_START_AT_SCORE = 5;
const FLOOR_FADE_INITIAL_DELAY = 180;
const FLOOR_FADE_TIME_BETWEEN_FLOORS = 30;
const FLOOR_FADE_MAX_FLOORS_AT_ONCE = 10000;
const FLOOR_FADE_ALPHA_SPEED = 0.02;
const FLOOR_FADE_MIN_ALPHA = 0.1;
const FADING_FLOOR_MIN_ALPHA_FOR_COLLISION = 0.1;
const GAME_OVER_FALL_THRESHOLD = 1000;


const MOVING_FLOOR_COLOR = "#4a9eff";
const SHRINKING_FLOOR_COLOR = "#4aff4a";
const BREAKING_FLOOR_COLOR = "#ff4a4a";
const MOVING_FLOOR_ENABLED = true;
const MOVING_FLOOR_MIN_WIDTH = 70;
const MOVING_FLOOR_MAX_WIDTH = 215;
const MOVING_FLOOR_SPEED = 2;
const MOVING_FLOOR_RANGE = 120;
const MOVING_FLOOR_MIN_X = 10;
const MOVING_FLOOR_MAX_X = 420;
const SHRINKING_FLOOR_ENABLED = true;
const SHRINKING_FLOOR_MIN_WIDTH = 7;
const SHRINKING_FLOOR_SHRINK_SPEED = 0.2;
const SHRINKING_FLOOR_START_DELAY = 180;
const BREAKING_FLOOR_ENABLED = true;
const BREAKING_FLOOR_MIN_WIDTH = 70;
const BREAKING_FLOOR_MAX_WIDTH = 150;
const BREAKING_FLOOR_FADE_SPEED = 0.03;
const BASE_MOVING_FLOOR_CHANCE = 0.1;
const BASE_SHRINKING_FLOOR_CHANCE = 0.1;
const BASE_BREAKING_FLOOR_CHANCE = 0.05;


const DIFFICULTY_ENABLED = true;
const DIFFICULTY_START_AT_SCORE = 5;
const DIFFICULTY_FLOOR_FADE_MULTIPLIER = 1.5;
const DIFFICULTY_MAX_FADE_MULTIPLIER = 5;
const DIFFICULTY_SPECIAL_FLOOR_CHANCE = 0.01;
const DIFFICULTY_CHANCE_PER_FLOOR = 0.01;
const DIFFICULTY_MAX_CHANCE = 0.3;
const DIFFICULTY_MOVING_SPEED_MULTIPLIER = 1.5;
const DIFFICULTY_MOVING_RANGE_MULTIPLIER = 1.3;
const DIFFICULTY_SHRINKING_MIN_WIDTH_MULTIPLIER = 0.7;
const DIFFICULTY_SHRINKING_SPEED_MULTIPLIER = 1.5;
const DIFFICULTY_SHRINKING_DELAY_MULTIPLIER = 0.5;
const DIFFICULTY_BREAKING_FADE_SPEED_MULTIPLIER = 2.0;


const CANNON_ENABLED = true;
const CANNON_CHANCE = 0.02;
const CANNON_HORIZONTAL_LENGTH = 20;
const CANNON_VERTICAL_LENGTH = 10;
const CANNON_THICKNESS = 5;
const CANNON_COLOR = "#ffff00";
const SMALL_PLAYER_RADIUS = 5;
const CANNON_MAX_PLAYER_RADIUS = 10;


const CCD_ENABLED = true;
const CCD_MAX_STEPS = 10;
const CCD_MIN_VELOCITY_FOR_STEPS = 8;


const GAME_OVER_ENABLED = true;


const COINS_ENABLED = true;
const COIN_CHANCE_BASE = 0.15;
const COIN_CHANCE_PER_FLOOR = 0.005;
const COIN_MAX_CHANCE = 0.8;
const MIN_FLOOR_FOR_COINS = 1;
const MIN_COINS_PER_FLOOR = 1;
const MAX_COINS_PER_FLOOR = 3;
const COINS_PER_FLOOR_MULTIPLIER = 1.005;
const COIN_Y_OFFSET = -15;
const COIN_RADIUS = 6;
const COIN_COLOR = "#FFD700";
const COIN_OUTLINE_COLOR = "#FFA500";
const COIN_OUTLINE_WIDTH = 1.5;
const COIN_GLOW_COLOR = "rgba(255, 215, 0, 0.3)";
const COIN_GLOW_SIZE = 3;
const COIN_COLLECT_EFFECT_ENABLED = true;
const COIN_COLLECT_EFFECT_DURATION = 20;
const COIN_COLLECT_EFFECT_COLOR = "#FFFF00";
const COIN_COLLECT_EFFECT_SIZE_MULTIPLIER = 2;
const SHOW_COINS_COUNT = true;
const COIN_COUNTER_POS_X = CANVAS_WIDTH - 30;
const COIN_COUNTER_POS_Y = 30;
const COIN_COUNTER_COLOR = "#FFD700";
const COIN_COUNTER_FONT = "bold 20px monospace";
const SAVE_COINS_KEY = "icy_tower_total_coins";


const SAVE_SCORE_KEY = "icy_tower_high_score";
const SAVE_DATA_KEY = "icy_tower_game_data";


const SHOW_HEIGHT_DEBUG = false;
const SHOW_VELOCITY_DEBUG = false;
const SHOW_BOOST_HINT = false;
const SHOW_BOOST_ACTIVATED = true;
const SHOW_FLOOR_DEBUG = false;
const BOOST_HINT_COLOR = "#ffff00";
const BOOST_ACTIVATED_COLOR = "#ff8000";
const BOOST_ACTIVATED_DURATION = 10;


const AUTO_JUMP_ENABLED = false;
const MOBILE_CONTROLS_ENABLED = false;
const USE_ACCELEROMETER = false;
const TOUCH_AREA_WIDTH = 215;


const WIND_ARROW_POS_X = 30;
const WIND_ARROW_POS_Y = 100;
const WIND_ARROW_SIZE = 20;
const WIND_ARROW_COLOR = "#87CEEB";
const WIND_ARROW_ALPHA = 0.8;
const WIND_DEBUG_DISPLAY = false;


const BALL_DISPLAY_NAMES = {
    [BALL_TYPES.STANDARD]: 'Standard',
    [BALL_TYPES.RUBBER]: 'Gum',
    [BALL_TYPES.BEACH]: 'Beach',
    [BALL_TYPES.GOLF]: 'Golf'
};


const BALL_UNLOCK_PRICES = {
    [BALL_TYPES.STANDARD]: 0,
    [BALL_TYPES.RUBBER]: 50,
    [BALL_TYPES.BEACH]: 100,
    [BALL_TYPES.GOLF]: 150
};




const STANDARD_BALL_CONFIG = {
    
    RADIUS: 15,
    COLOR: "#4a9eff",
    
    
    ACCELERATION: 0.2,
    MAX_SPEED: 8,
    GROUND_FRICTION: 0.96,
    AIR_RESISTANCE: 0.98,
    
    
    GRAVITY: 0.5,
    BASE_JUMP_FORCE: -12,
    MAX_JUMP_BONUS: -10,
    
    
    WALL_BOUNCE_FACTOR: 0.7,
    MIN_BOUNCE_VELOCITY: 0.5,
    
    
    WALL_BOOST_ENABLED: true,
    WALL_BOOST_MIN_VELOCITY: 3,
    WALL_BOOST_MAX_DISTANCE: 30,
    WALL_BOOST_VELOCITY_X: 8,
    WALL_BOOST_VELOCITY_Y: -8,
    
    
    FLOOR_REACH_THRESHOLD: 5,
    FLOOR_COLLISION_TOLERANCE: 10,
    
    
    WIND_ENABLED: false,
    WIND_DEBUG_DISPLAY: false,
    WIND_MAX_FORCE: 0.3,
    WIND_MIN_FORCE: 0.05,
    WIND_MIN_BURST_DURATION: 180,
    WIND_MAX_BURST_DURATION: 300,
    WIND_MIN_BREAK_DURATION: 120,
    WIND_MAX_BREAK_DURATION: 240,
    WIND_RAMP_UP_MIN_TIME: 30,
    WIND_RAMP_UP_MAX_TIME: 60,
    WIND_RAMP_DOWN_MIN_TIME: 30,
    WIND_RAMP_DOWN_MAX_TIME: 60,
    WIND_AFFECTS_GROUNDED: true,
    WIND_AFFECTS_AIR: true,
    WIND_AIR_MULTIPLIER: 2.0,
    
    
    CAN_USE_CANNON: false,
    CANNON_BOOST_FORCE: -50,
    
    
    MAGNET_ENABLED: false,
    MAGNET_RANGE: 0,
    MAGNET_FORCE: 0
};

const RUBBER_BALL_CONFIG = {
    
    RADIUS: 12,
    COLOR: "#ff4a4a",
    
    
    ACCELERATION: 0.3,
    MAX_SPEED: 10,
    GROUND_FRICTION: 0.92,
    AIR_RESISTANCE: 0.98,
    
    
    GRAVITY: 1,
    BASE_JUMP_FORCE: -20,
    MAX_JUMP_BONUS: -12,
    
    
    WALL_BOUNCE_FACTOR: 1.2,
    MIN_BOUNCE_VELOCITY: 0.2,
    
    
    WALL_BOOST_ENABLED: true,
    WALL_BOOST_MIN_VELOCITY: 1,
    WALL_BOOST_MAX_DISTANCE: 50,
    WALL_BOOST_VELOCITY_X: 8,
    WALL_BOOST_VELOCITY_Y: -20,
    
    
    FLOOR_REACH_THRESHOLD: 5,
    FLOOR_COLLISION_TOLERANCE: 10,
    
    
    WIND_ENABLED: false,
    WIND_DEBUG_DISPLAY: false,
    WIND_MAX_FORCE: 0.3,
    WIND_MIN_FORCE: 0.05,
    WIND_MIN_BURST_DURATION: 180,
    WIND_MAX_BURST_DURATION: 300,
    WIND_MIN_BREAK_DURATION: 120,
    WIND_MAX_BREAK_DURATION: 240,
    WIND_RAMP_UP_MIN_TIME: 30,
    WIND_RAMP_UP_MAX_TIME: 60,
    WIND_RAMP_DOWN_MIN_TIME: 30,
    WIND_RAMP_DOWN_MAX_TIME: 60,
    WIND_AFFECTS_GROUNDED: true,
    WIND_AFFECTS_AIR: true,
    WIND_AIR_MULTIPLIER: 2.0,
    
    
    CAN_USE_CANNON: false,
    CANNON_BOOST_FORCE: -50,
    
    
    MAGNET_ENABLED: false,
    MAGNET_RANGE: 0,
    MAGNET_FORCE: 0
};

const BEACH_BALL_CONFIG = {
        
    RADIUS: 20,
    COLOR: "#efdc00",
    
    
    ACCELERATION: 0.4,
    MAX_SPEED: 6,
    GROUND_FRICTION: 0.98,
    AIR_RESISTANCE: 0.96,
    
    
    GRAVITY: 0.3,
    BASE_JUMP_FORCE: -10,
    MAX_JUMP_BONUS: -10,
    
    
    WALL_BOUNCE_FACTOR: 0.5,
    MIN_BOUNCE_VELOCITY: 0.7,
    
    
    WALL_BOOST_ENABLED: true,
    WALL_BOOST_MIN_VELOCITY: 0.5,
    WALL_BOOST_MAX_DISTANCE: 100,
    WALL_BOOST_VELOCITY_X: 8,
    WALL_BOOST_VELOCITY_Y: -8,
    
    
    FLOOR_REACH_THRESHOLD: 5,
    FLOOR_COLLISION_TOLERANCE: 10,
    
    
    
    WIND_ENABLED: true,
    WIND_DEBUG_DISPLAY: true,
    WIND_MAX_FORCE: 0.65,
    WIND_MIN_FORCE: 0.08,
    WIND_MIN_BURST_DURATION: 10,
    WIND_MAX_BURST_DURATION: 70,
    WIND_MIN_BREAK_DURATION: 30,
    WIND_MAX_BREAK_DURATION: 180,
    WIND_RAMP_UP_MIN_TIME: 5,
    WIND_RAMP_UP_MAX_TIME: 20,
    WIND_RAMP_DOWN_MIN_TIME: 5,
    WIND_RAMP_DOWN_MAX_TIME: 20,
    WIND_AFFECTS_GROUNDED: true,
    WIND_AFFECTS_AIR: true,
    WIND_AIR_MULTIPLIER: 2.0,
    
    
    CAN_USE_CANNON: false,
    CANNON_BOOST_FORCE: -50,
    
    
    MAGNET_ENABLED: false,
    MAGNET_RANGE: 0,
    MAGNET_FORCE: 0
};

const GOLF_BALL_CONFIG = {
    
    RADIUS: 5,
    COLOR: "#ffffff",
    
    
    ACCELERATION: 0.3,
    MAX_SPEED: 14,
    GROUND_FRICTION: 0.98,
    AIR_RESISTANCE: 0.99,
    
    
    GRAVITY: 0.5,
    BASE_JUMP_FORCE: -15,
    MAX_JUMP_BONUS: -15,
    
    
    WALL_BOUNCE_FACTOR: 0.7,
    MIN_BOUNCE_VELOCITY: 0.5,
    
    
    WALL_BOOST_ENABLED: true,
    WALL_BOOST_MIN_VELOCITY: 3,
    WALL_BOOST_MAX_DISTANCE: 30,
    WALL_BOOST_VELOCITY_X: 8,
    WALL_BOOST_VELOCITY_Y: -8,
    
    
    FLOOR_REACH_THRESHOLD: 2,
    FLOOR_COLLISION_TOLERANCE: 2,
    
    
    
    WIND_ENABLED: false,
    WIND_DEBUG_DISPLAY: false,
    WIND_MAX_FORCE: 0.3,
    WIND_MIN_FORCE: 0.05,
    WIND_MIN_BURST_DURATION: 180,
    WIND_MAX_BURST_DURATION: 300,
    WIND_MIN_BREAK_DURATION: 120,
    WIND_MAX_BREAK_DURATION: 240,
    WIND_RAMP_UP_MIN_TIME: 30,
    WIND_RAMP_UP_MAX_TIME: 60,
    WIND_RAMP_DOWN_MIN_TIME: 30,
    WIND_RAMP_DOWN_MAX_TIME: 60,
    WIND_AFFECTS_GROUNDED: true,
    WIND_AFFECTS_AIR: true,
    WIND_AIR_MULTIPLIER: 2.0,
    
    
    CAN_USE_CANNON: true,
    CANNON_BOOST_FORCE: -50,
    
    
    MAGNET_ENABLED: false,
    MAGNET_RANGE: 0,
    MAGNET_FORCE: 0
};


const UPGRADE_DEFINITIONS = {
    [BALL_TYPES.STANDARD]: [
        {
            id: 'speed',
            name: 'Speed',
            description: 'Increases ball acceleration',
            basePrice: 100,
            maxLevel: 3,
            effect: (currentConfig, level) => ({
                ...currentConfig,
                ACCELERATION: currentConfig.ACCELERATION + 0.1
            })
        },
        {
            id: 'jump',
            name: 'Jump',
            description: 'Increases jump force',
            basePrice: 150,
            maxLevel: 3,
            effect: (currentConfig, level) => {
                const jumpMultiplier = 1 + level * 0.2;
                return {
                    ...currentConfig,
                    BASE_JUMP_FORCE: currentConfig.BASE_JUMP_FORCE * jumpMultiplier,
                    MAX_JUMP_BONUS: currentConfig.MAX_JUMP_BONUS * jumpMultiplier
                };
            }
        },
        {
            id: 'coin_magnet',
            name: 'Coin Magnet',
            description: 'Attracts coins from a distance',
            basePrice: 200,
            maxLevel: 3,
            effect: (currentConfig, level) => {
                const newConfig = { ...currentConfig };
                if (level >= 1) {
                    newConfig.MAGNET_ENABLED = true;
                    newConfig.MAGNET_RANGE = 250;
                    newConfig.MAGNET_FORCE = 2;
                }
                if (level >= 2) {
                    newConfig.MAGNET_RANGE = 350;
                    newConfig.MAGNET_FORCE = 5;
                }
                if (level >= 3) {
                    newConfig.MAGNET_RANGE = 500;
                    newConfig.MAGNET_FORCE = 10;
                }
                return newConfig;
            }
        }
    ],
    
    [BALL_TYPES.RUBBER]: [
        {
            id: 'speed',
            name: 'Speed',
            description: 'Increases ball acceleration',
            basePrice: 100,
            maxLevel: 3,
            effect: (currentConfig, level) => ({
                ...currentConfig,
                ACCELERATION: currentConfig.ACCELERATION + 0.05
            })
        },
        {
            id: 'jump',
            name: 'Jump',
            description: 'Increases jump force',
            basePrice: 150,
            maxLevel: 3,
            effect: (currentConfig, level) => {
                const jumpMultiplier = 1 + level * 0.2;
                return {
                    ...currentConfig,
                    BASE_JUMP_FORCE: currentConfig.BASE_JUMP_FORCE * jumpMultiplier,
                    MAX_JUMP_BONUS: currentConfig.MAX_JUMP_BONUS * jumpMultiplier
                };
            }
        },
        {
            id: 'wall_boost',
            name: 'Wall Boost',
            description: 'Increases wall bounce boost value',
            basePrice: 200,
            maxLevel: 3,
            effect: (currentConfig, level) => {
                const boostMultiplier = 1 + level * 0.3;
                return {
                    ...currentConfig,
                    WALL_BOOST_VELOCITY_Y: currentConfig.WALL_BOOST_VELOCITY_Y +2,
                    WALL_BOOST_VELOCITY_X: currentConfig.WALL_BOOST_VELOCITY_X +2
                };
            }
        }
    ],
    
    [BALL_TYPES.BEACH]: [
        {
            id: 'speed',
            name: 'Speed',
            description: 'Increases ball acceleration',
            basePrice: 100,
            maxLevel: 3,
            effect: (currentConfig, level) => ({
                ...currentConfig,
                ACCELERATION: currentConfig.ACCELERATION + 0.1
            })
        },
        {
            id: 'jump',
            name: 'Jump',
            description: 'Increases jump force',
            basePrice: 150,
            maxLevel: 3,
            effect: (currentConfig, level) => {
                const jumpMultiplier = 1 + level * 0.2;
                return {
                    ...currentConfig,
                    BASE_JUMP_FORCE: currentConfig.BASE_JUMP_FORCE * jumpMultiplier,
                    MAX_JUMP_BONUS: currentConfig.MAX_JUMP_BONUS * jumpMultiplier
                };
            }
        },
        {
            id: 'wind_resistance',
            name: 'Wind Resistance',
            description: 'Reduces the effect of wind on the ball',
            basePrice: 200,
            maxLevel: 3,
            effect: (currentConfig, level) => {
                const resistance = 1 - (level * 0.15);
                return {
                    ...currentConfig,
                    WIND_MAX_FORCE: currentConfig.WIND_MAX_FORCE * resistance,
                    WIND_MIN_FORCE: currentConfig.WIND_MIN_FORCE * resistance,
                };
            }
        }
    ],
    
    [BALL_TYPES.GOLF]: [
        {
            id: 'speed',
            name: 'Speed',
            description: 'Increases ball acceleration',
            basePrice: 100,
            maxLevel: 3,
            effect: (currentConfig, level) => ({
                ...currentConfig,
                ACCELERATION: currentConfig.ACCELERATION + 0.1
            })
        },
        {
            id: 'jump',
            name: 'Jump',
            description: 'Increases jump force',
            basePrice: 150,
            maxLevel: 3,
            effect: (currentConfig, level) => {
                const jumpMultiplier = 1 + level * 0.2;
                return {
                    ...currentConfig,
                    BASE_JUMP_FORCE: currentConfig.BASE_JUMP_FORCE * jumpMultiplier,
                    MAX_JUMP_BONUS: currentConfig.MAX_JUMP_BONUS * jumpMultiplier
                };
            }
        },
        {
            id: 'cannon_boost',
            name: 'Cannon Boost',
            description: 'Increases cannon boost value',
            basePrice: 200,
            maxLevel: 3,
            effect: (currentConfig, level) => {
                const boostMultiplier = 1 + level * 0.25;
                return {
                    ...currentConfig,
                    CANNON_BOOST_FORCE: currentConfig.CANNON_BOOST_FORCE * boostMultiplier
                };
            }
        }
    ]
};




function getUpgradePrice(basePrice, level) {
    return Math.floor(basePrice + (level*50));
}


function applyUpgradesToConfig(ballType, baseConfig, playerUpgrades) {
    let config = { ...baseConfig };
    const upgrades = playerUpgrades[ballType] || {};
    
    Object.entries(upgrades).forEach(([upgradeId, upgradeData]) => {
        if (upgradeData.level > 0 && upgradeData.active !== false) {
            const upgradeDef = UPGRADE_DEFINITIONS[ballType]?.find(u => u.id === upgradeId);
            if (upgradeDef && upgradeDef.effect) {
                config = upgradeDef.effect(config, upgradeData.level);
            }
        }
    });
    
    return config;
}


function getBaseBallConfig(ballType) {
    switch(ballType) {
        case BALL_TYPES.RUBBER:
            return RUBBER_BALL_CONFIG;
        case BALL_TYPES.BEACH:
            return BEACH_BALL_CONFIG;
        case BALL_TYPES.GOLF:
            return GOLF_BALL_CONFIG;
        case BALL_TYPES.STANDARD:
        default:
            return STANDARD_BALL_CONFIG;
    }
}


function getBallConfigWithUpgrades(ballType, playerUpgrades = {}) {
    const baseConfig = getBaseBallConfig(ballType);
    return applyUpgradesToConfig(ballType, baseConfig, playerUpgrades);
}


function getUpgradeDefinitions(ballType) {
    return UPGRADE_DEFINITIONS[ballType] || [];
}


function getBallUnlockPrice(ballType) {
    return BALL_UNLOCK_PRICES[ballType] || 0;
}


function canBallUseCannon(ballType) {
    const config = getBaseBallConfig(ballType);
    return config.CAN_USE_CANNON || false;
}


function getBallDisplayName(ballType) {
    return BALL_DISPLAY_NAMES[ballType] || ballType;
}


function getBallColor(ballType) {
    const config = getBaseBallConfig(ballType);
    return config.COLOR || "#4a9eff";
}




function getCanvasScale() {
    const container = document.getElementById('game-container');
    if (!container) return 1;
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const scaleX = containerWidth / CANVAS_WIDTH;
    const scaleY = containerHeight / CANVAS_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    
    return scale;
}


function scalePosition(value, axis = 'x') {
    const scale = getCanvasScale();
    return value * scale;
}


window.GameConfig = {
    
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    CANVAS_BACKGROUND_COLOR,
    FPS,
    
    
    MOBILE_BREAKPOINT,
    
    
    BALL_TYPES,
    BALL_DISPLAY_NAMES,
    BALL_UNLOCK_PRICES,
    
    
    STANDARD_BALL_CONFIG,
    RUBBER_BALL_CONFIG,
    BEACH_BALL_CONFIG,
    GOLF_BALL_CONFIG,
    
    
    UPGRADE_DEFINITIONS,
    getUpgradePrice,
    applyUpgradesToConfig,
    getUpgradeDefinitions,
    
    
    COINS_ENABLED,
    COIN_CHANCE_BASE,
    COIN_CHANCE_PER_FLOOR,
    COIN_MAX_CHANCE,
    MIN_FLOOR_FOR_COINS,
    MIN_COINS_PER_FLOOR,
    MAX_COINS_PER_FLOOR,
    COINS_PER_FLOOR_MULTIPLIER,
    COIN_Y_OFFSET,
    COIN_RADIUS,
    COIN_COLOR,
    COIN_OUTLINE_COLOR,
    COIN_OUTLINE_WIDTH,
    COIN_GLOW_COLOR,
    COIN_GLOW_SIZE,
    COIN_COLLECT_EFFECT_ENABLED,
    COIN_COLLECT_EFFECT_DURATION,
    COIN_COLLECT_EFFECT_COLOR,
    COIN_COLLECT_EFFECT_SIZE_MULTIPLIER,
    SHOW_COINS_COUNT,
    COIN_COUNTER_POS_X,
    COIN_COUNTER_POS_Y,
    COIN_COUNTER_COLOR,
    COIN_COUNTER_FONT,
    SAVE_COINS_KEY,
    
    
    CANNON_ENABLED,
    CANNON_CHANCE,
    CANNON_HORIZONTAL_LENGTH,
    CANNON_VERTICAL_LENGTH,
    CANNON_THICKNESS,
    CANNON_COLOR,
    CANNON_MAX_PLAYER_RADIUS,
    SMALL_PLAYER_RADIUS,
    
    
    SHOW_HEIGHT_DEBUG,
    SHOW_VELOCITY_DEBUG,
    SHOW_BOOST_HINT,
    SHOW_BOOST_ACTIVATED,
    BOOST_ACTIVATED_DURATION,
    SHOW_FLOOR_DEBUG,
    BOOST_HINT_COLOR,
    BOOST_ACTIVATED_COLOR,
    AUTO_JUMP_ENABLED,
    MOBILE_CONTROLS_ENABLED,
    USE_ACCELEROMETER,
    TOUCH_AREA_WIDTH,
    WIND_ARROW_POS_X,
    WIND_ARROW_POS_Y,
    WIND_ARROW_SIZE,
    WIND_ARROW_COLOR,
    WIND_ARROW_ALPHA,
    WIND_DEBUG_DISPLAY,
   
    
    PLAYER_START_X,
    PLAYER_START_Y,
    
    
    WALL_THICKNESS,
    WALL_COLOR,
    WALL_LEFT_X,
    WALL_RIGHT_X,
    CAMERA_THRESHOLD,
    
    
    FLOOR_HEIGHT,
    FLOOR_COLOR,
    SPECIAL_FLOOR_COLOR,
    START_FLOOR_WIDTH,
    FLOOR_MIN_WIDTH,
    FLOOR_MAX_WIDTH,
    FLOOR_VERTICAL_SPACING,
    FLOOR_MAX_HORIZONTAL_GAP,
    FLOOR_MARGIN,
    SPECIAL_FLOOR_INTERVAL,
    SPECIAL_FLOOR_WIDTH,
    FLOORS_TO_GENERATE_AHEAD,
    FLOORS_TO_GENERATE_BEHIND,
    FLOOR_FADE_START_AT_SCORE,
    FLOOR_FADE_INITIAL_DELAY,
    FLOOR_FADE_TIME_BETWEEN_FLOORS,
    FLOOR_FADE_MAX_FLOORS_AT_ONCE,
    FLOOR_FADE_ALPHA_SPEED,
    FLOOR_FADE_MIN_ALPHA,
    FADING_FLOOR_MIN_ALPHA_FOR_COLLISION,
    GAME_OVER_ENABLED,
    GAME_OVER_FALL_THRESHOLD,
    
    
    DIFFICULTY_ENABLED,
    DIFFICULTY_START_AT_SCORE,
    DIFFICULTY_FLOOR_FADE_MULTIPLIER,
    DIFFICULTY_MAX_FADE_MULTIPLIER,
    DIFFICULTY_SPECIAL_FLOOR_CHANCE,
    DIFFICULTY_CHANCE_PER_FLOOR,
    DIFFICULTY_MAX_CHANCE,
    DIFFICULTY_MOVING_SPEED_MULTIPLIER,
    DIFFICULTY_MOVING_RANGE_MULTIPLIER,
    DIFFICULTY_SHRINKING_MIN_WIDTH_MULTIPLIER,
    DIFFICULTY_SHRINKING_SPEED_MULTIPLIER,
    DIFFICULTY_SHRINKING_DELAY_MULTIPLIER,
    DIFFICULTY_BREAKING_FADE_SPEED_MULTIPLIER,
    
    
    MOVING_FLOOR_COLOR,
    SHRINKING_FLOOR_COLOR,
    BREAKING_FLOOR_COLOR,
    MOVING_FLOOR_ENABLED,
    MOVING_FLOOR_MIN_WIDTH,
    MOVING_FLOOR_MAX_WIDTH,
    MOVING_FLOOR_SPEED,
    MOVING_FLOOR_RANGE,
    MOVING_FLOOR_MIN_X,
    MOVING_FLOOR_MAX_X,
    SHRINKING_FLOOR_ENABLED,
    SHRINKING_FLOOR_MIN_WIDTH,
    SHRINKING_FLOOR_SHRINK_SPEED,
    SHRINKING_FLOOR_START_DELAY,
    BREAKING_FLOOR_ENABLED,
    BREAKING_FLOOR_MIN_WIDTH,
    BREAKING_FLOOR_MAX_WIDTH,
    BREAKING_FLOOR_FADE_SPEED,
    BASE_MOVING_FLOOR_CHANCE,
    BASE_SHRINKING_FLOOR_CHANCE,
    BASE_BREAKING_FLOOR_CHANCE,
    
    
    CCD_ENABLED,
    CCD_MAX_STEPS,
    CCD_MIN_VELOCITY_FOR_STEPS,
    
    
    SAVE_SCORE_KEY,
    
    
    getBaseBallConfig,
    getBallConfigWithUpgrades,
    getBallUnlockPrice,
    canBallUseCannon,
    getBallDisplayName,
    getBallColor,
    
    
    getCanvasScale,
    scalePosition
};

console.log('GameConfig załadowany pomyślnie - wszystko w piłkach, brak duplikatów');
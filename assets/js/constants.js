/**
 * Centralized Game Constants & Configurations
 */

export const GRID_CONFIG = Object.freeze({
    DEFAULT_SIZE: 4,
    MIN_SIZE: 3,
    MAX_SIZE: 6,
    START_TILES: 2,
    HISTORY_LIMIT: 15,
    UNDO_PENALTY: 100,
    PROBABILITY_FOUR: 0.1, // 10% chance of spawning 4, 90% chance of spawning 2
    WINNING_VALUE: 2048
});

export const MODE_CONFIG = Object.freeze({
    CLASSIC: 'classic',
    TIME: 'time',
    SURVIVAL: 'survival',
    TIME_ATTACK_INITIAL: 60,
    TIME_ATTACK_BONUS: 1,
    SURVIVAL_INITIAL: 15
});

export const SKIN_CONFIG = Object.freeze({
    CLASSIC: 'classic',
    EMOJI: 'emoji',
    EMOJI_MAP: Object.freeze({
        2: '🥚',
        4: '🐣',
        8: '🐥',
        16: '🐔',
        32: '🕊️',
        64: '🦆',
        128: '🦅',
        256: '🦉',
        512: '🦇',
        1024: '🐉',
        2048: '👑',
        4096: '🌟',
        8192: '💎',
        16384: '🔮',
        32768: '🚀',
        65536: '🌌',
        131072: '👽'
    }),
    DEFAULT_EMOJI: '🦄'
});

export const STORAGE_KEYS = Object.freeze({
    BEST_SCORE: 'bestScore',
    LEADERBOARD: 'leaderboard',
    GAME_STATE: 'gameState',
    NOTICE_CLOSED: 'noticeClosed',
    THEME: 'theme',
    SKIN: 'skin',
    GAME_MODE: 'gameMode',
    LANGUAGE: 'language',
    GRID_SIZE: 'gridSize'
});

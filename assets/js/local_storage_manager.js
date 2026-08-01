const fakeStorage = {
    _data: {},

    setItem(id, val) {
        return this._data[id] = String(val);
    },

    getItem(id) {
        return Object.hasOwn(this._data, id) ? this._data[id] : undefined;
    },

    removeItem(id) {
        return delete this._data[id];
    },

    clear() {
        return this._data = {};
    }
};

export default class LocalStorageManager {
    constructor() {
        this.bestScoreKey = "bestScore";
        this.leaderboardKey = "leaderboard";
        this.gameStateKey = "gameState";
        this.noticeClosedKey = "noticeClosed";
        this.themeKey = "theme";
        this.skinKey = "skin"; // 'classic' or 'emoji'
        this.gameModeKey = "gameMode"; // 'classic', 'time', 'survival'
        this.languageKey = "language"; // 'en', 'vi'

        const supported = this.localStorageSupported();
        this.storage = supported ? window.localStorage : fakeStorage;
    }

    localStorageSupported() {
        const testKey = "test";
        const storage = window.localStorage;

        try {
            storage.setItem(testKey, "1");
            storage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    getLeaderboard() {
        try {
            return JSON.parse(this.storage.getItem(this.leaderboardKey)) || [];
        } catch {
            return [];
        }
    }

    // Best score getters/setters
    getBestScore(size) {
        const key = size ? `${this.bestScoreKey}_${size}` : this.bestScoreKey;
        return parseInt(this.storage.getItem(key), 10) || 0;
    }

    setBestScore(score, size) {
        const key = size ? `${this.bestScoreKey}_${size}` : this.bestScoreKey;
        this.storage.setItem(key, score);
    }

    addLeaderboard(score) {
        if (score === 0) return;
        const board = this.getLeaderboard();
        board.push({ score, date: new Date().toISOString() });
        board.sort((a, b) => b.score - a.score);
        const top5 = board.slice(0, 5);
        this.storage.setItem(this.leaderboardKey, JSON.stringify(top5));
    }

    // Game state getters/setters and clearing
    getGameState() {
        const stateJSON = this.storage.getItem(this.gameStateKey);
        return stateJSON ? JSON.parse(stateJSON) : null;
    }

    setGameState(gameState) {
        this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
    }

    clearGameState() {
        this.storage.removeItem(this.gameStateKey);
    }

    setNoticeClosed(closed) {
        this.storage.setItem(this.noticeClosedKey, JSON.stringify(closed));
    }

    getNoticeClosed() {
        return JSON.parse(this.storage.getItem(this.noticeClosedKey) || "false");
    }

    // --- SAVE SLOTS ---
    saveGameSlot(slotId, state) {
        this.storage.setItem(`saveSlot_${slotId}`, JSON.stringify(state));
    }

    loadGameSlot(slotId) {
        try {
            const stateJSON = this.storage.getItem(`saveSlot_${slotId}`);
            return stateJSON ? JSON.parse(stateJSON) : null;
        } catch {
            return null;
        }
    }

    getGameSlotInfo(slotId) {
        const state = this.loadGameSlot(slotId);
        if (!state) return null;
        return {
            score: state.score,
            mode: state.gameMode || 'classic'
        };
    }

    getLanguage() {
        return this.storage.getItem(this.languageKey) || 'vi'; // Default to VI
    }

    setLanguage(lang) {
        this.storage.setItem(this.languageKey, lang);
    }

    setItem(key, value) {
        this.storage.setItem(key, value);
    }

    getItem(key) {
        return this.storage.getItem(key);
    }
}
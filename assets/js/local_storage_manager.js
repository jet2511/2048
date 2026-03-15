const fakeStorage = {
    _data: {},

    setItem(id, val) {
        return this._data[id] = String(val);
    },

    getItem(id) {
        return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
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
        this.gameStateKey = "gameState";
        this.noticeClosedKey = "noticeClosed";

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

    // Best score getters/setters
    getBestScore(size = 4) {
        return this.storage.getItem(`${this.bestScoreKey}_${size}`) || 0;
    }

    setBestScore(score, size = 4) {
        this.storage.setItem(`${this.bestScoreKey}_${size}`, score);
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

    setNoticeClosed(noticeClosed) {
        this.storage.setItem(this.noticeClosedKey, JSON.stringify(noticeClosed));
    }

    getNoticeClosed() {
        return JSON.parse(this.storage.getItem(this.noticeClosedKey) || "false");
    }

    setItem(key, value) {
        this.storage.setItem(key, value);
    }

    getItem(key) {
        return this.storage.getItem(key);
    }
}
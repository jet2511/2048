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
        this.statsKey = "gameStats";

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

    getStats(size = null) {
        const statsJSON = this.storage.getItem(this.statsKey);
        const allStats = statsJSON ? JSON.parse(statsJSON) : {
            "3": this.getDefaultStats(),
            "4": this.getDefaultStats(),
            "5": this.getDefaultStats(),
            "6": this.getDefaultStats()
        };
        
        if (size === null) {
            return this.calculateTotalStats(allStats);
        }
        
        return allStats[size.toString()] || this.getDefaultStats();
    }

    getDefaultStats() {
        return {
            totalGames: 0,
            gamesWon: 0,
            gamesLost: 0,
            bestScore: 0,
            bestTile: 2
        };
    }

    calculateTotalStats(allStats) {
        const total = this.getDefaultStats();
        
        Object.values(allStats).forEach(stats => {
            total.totalGames += stats.totalGames;
            total.gamesWon += stats.gamesWon;
            total.gamesLost += stats.gamesLost;
            total.bestScore = Math.max(total.bestScore, stats.bestScore);
            total.bestTile = Math.max(total.bestTile, stats.bestTile);
        });
        
        return total;
    }

    updateStats(result, score, bestTile, size) {
        const statsJSON = this.storage.getItem(this.statsKey);
        const allStats = statsJSON ? JSON.parse(statsJSON) : {
            "3": this.getDefaultStats(),
            "4": this.getDefaultStats(),
            "5": this.getDefaultStats(),
            "6": this.getDefaultStats()
        };
        
        const sizeKey = size.toString();
        if (!allStats[sizeKey]) {
            allStats[sizeKey] = this.getDefaultStats();
        }
        
        allStats[sizeKey].totalGames++;
        
        if (result === "won") {
            allStats[sizeKey].gamesWon++;
        } else if (result === "lost") {
            allStats[sizeKey].gamesLost++;
        }
        
        if (score > allStats[sizeKey].bestScore) {
            allStats[sizeKey].bestScore = score;
        }
        
        if (bestTile > allStats[sizeKey].bestTile) {
            allStats[sizeKey].bestTile = bestTile;
        }
        
        this.storage.setItem(this.statsKey, JSON.stringify(allStats));
        return allStats;
    }

    resetStats(size = null) {
        const statsJSON = this.storage.getItem(this.statsKey);
        let allStats = statsJSON ? JSON.parse(statsJSON) : {
            "3": this.getDefaultStats(),
            "4": this.getDefaultStats(),
            "5": this.getDefaultStats(),
            "6": this.getDefaultStats()
        };
        
        if (size === null) {
            allStats = {
                "3": this.getDefaultStats(),
                "4": this.getDefaultStats(),
                "5": this.getDefaultStats(),
                "6": this.getDefaultStats()
            };
        } else {
            allStats[size.toString()] = this.getDefaultStats();
        }
        
        this.storage.setItem(this.statsKey, JSON.stringify(allStats));
        return size === null ? this.calculateTotalStats(allStats) : allStats;
    }

    getAllStats() {
        const statsJSON = this.storage.getItem(this.statsKey);
        return statsJSON ? JSON.parse(statsJSON) : {
            "3": this.getDefaultStats(),
            "4": this.getDefaultStats(),
            "5": this.getDefaultStats(),
            "6": this.getDefaultStats()
        };
    }
}
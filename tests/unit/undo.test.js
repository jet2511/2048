import { describe, it, expect, beforeEach } from 'vitest';
import GameManager from '../../assets/js/game_manager.js';
import Grid from '../../assets/js/grid.js';
import Tile from '../../assets/js/tile.js';

class MockInputManager {
    constructor() {
        this.events = {};
    }
    on(event, callback) {
        this.events[event] = callback;
    }
    emit(event, data) {
        if (this.events[event]) this.events[event](data);
    }
}

class MockActuator {
    setupGrid() {}
    updateSkinHighlight() {}
    updateModeHighlight() {}
    updateSizeHighlight() {}
    updateLanguageHighlight() {}
    translateDOM() {}
    setDarkMode() {}
    actuate() {}
    continueGame() {}
    updateTimer() {}
}

class MockStorageManager {
    constructor() {
        this.store = {};
    }
    getItem(k) { return this.store[k]; }
    setItem(k, v) { this.store[k] = v; }
    getGameState() { return this.store['gameState'] ? JSON.parse(this.store['gameState']) : null; }
    setGameState(s) { this.store['gameState'] = JSON.stringify(s); }
    clearGameState() { delete this.store['gameState']; }
    getBestScore() { return 0; }
    setBestScore() {}
    addLeaderboard() {}
    getLanguage() { return 'en'; }
    setLanguage() {}
}

class MockAudioManager {
    playSlide() {}
    playMerge() {}
    playBonus() {}
    playWin() {}
    toggle() { return true; }
}

describe('Undo Logic Consistency Test', () => {
    it('should restore score based on previous state score minus penalty', () => {
        const gm = new GameManager(4, MockInputManager, MockActuator, MockStorageManager, MockAudioManager);
        
        // Mock a specific grid state
        gm.grid = new Grid(4);
        gm.grid.insertTile(new Tile({ x: 0, y: 0 }, 2, 1));
        gm.grid.insertTile(new Tile({ x: 0, y: 1 }, 2, 2));
        gm.score = 100;

        // Perform move (up) which merges tiles: score goes from 100 to 104
        gm.move(0);

        expect(gm.score).toBe(104);
        expect(gm.history.length).toBe(1);

        // Perform undo:
        // Previous state score was 100. Penalty is 100.
        // Restored score should be max(0, 100 - 100) = 0, NOT (104 - 100) = 4!
        gm.undo();

        expect(gm.score).toBe(0);
    });
});

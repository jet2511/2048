import Grid from "./grid.js";
import Tile from "./tile.js";
import { t } from "./i18n.js";
import ClassicMode from "./modes/classic_mode.js";
import TimeAttackMode from "./modes/time_attack_mode.js";
import SurvivalMode from "./modes/survival_mode.js";
import { AuthManager } from "./auth_manager.js";
import { GameSyncService } from "./services/game_sync_service.js";
import { GRID_CONFIG, MODE_CONFIG, STORAGE_KEYS } from "./constants.js";

/**
 * GameManager
 * Controls core game loop, movement algorithms, undo history, and strategy execution.
 */
export default class GameManager {
    constructor(size, InputManager, Actuator, StorageManager, AudioManager) {
        this.storageManager = new StorageManager();
        const savedSize = this.storageManager.getItem(STORAGE_KEYS.GRID_SIZE);
        this.size = savedSize ? parseInt(savedSize, 10) : (size || GRID_CONFIG.DEFAULT_SIZE);
        this.gameMode = this.storageManager.getItem(STORAGE_KEYS.GAME_MODE) || MODE_CONFIG.CLASSIC;
        this.skin = this.storageManager.getItem(STORAGE_KEYS.SKIN) || 'classic';
        this.language = this.storageManager.getLanguage();

        this.inputManager = new InputManager();
        this.actuator = new Actuator();
        this.audioManager = new AudioManager();
        this.authManager = new AuthManager();

        this.startTiles = GRID_CONFIG.START_TILES;
        this.history = [];
        this.historyLimit = GRID_CONFIG.HISTORY_LIMIT;
        this.nextId = 0;
        this.modeStrategy = null;

        this.bindInputs();
        this.syncService = new GameSyncService(
            this.authManager,
            this.storageManager,
            this.actuator,
            {
                onCloudStateLoaded: (cloudState) => {
                    if (!this.score || cloudState.score > this.score) {
                        this.storageManager.setGameState(cloudState);
                        this.setup();
                    }
                }
            }
        );

        this.setup();
        this.applyTheme();
        this.applyLanguage();
        this.actuator.updateSkinHighlight(this.skin);
        this.actuator.updateModeHighlight(this.gameMode);
    }

    bindInputs() {
        const events = {
            move: this.move.bind(this),
            restart: this.restart.bind(this),
            keepPlaying: this.keepPlaying.bind(this),
            undo: this.undo.bind(this),
            changeSize: this.changeSize.bind(this),
            changeMode: this.changeMode.bind(this),
            changeSkin: this.changeSkin.bind(this),
            changeTheme: this.changeTheme.bind(this),
            changeLanguage: this.changeLanguage.bind(this),
            toggleSettings: this.toggleSettings.bind(this),
            toggleMute: this.toggleMute.bind(this),
            toggleProfile: this.toggleProfile.bind(this),
            toggleLeaderboard: this.toggleLeaderboard.bind(this),
            closeModals: this.closeModals.bind(this)
        };

        Object.entries(events).forEach(([evt, handler]) => {
            this.inputManager.on(evt, handler);
        });
    }

    createModeStrategy(mode) {
        if (this.modeStrategy) this.modeStrategy.destroy();

        const options = {
            onTimeUpdate: (timeRemaining, modeName) => {
                this.timeRemaining = timeRemaining;
                this.actuator.updateTimer(timeRemaining, modeName);
            },
            onTimeOut: () => {
                this.over = true;
                this.storageManager.addLeaderboard(this.score);
                this.actuate();
            }
        };

        switch (mode) {
            case MODE_CONFIG.TIME:
                return new TimeAttackMode(options);
            case MODE_CONFIG.SURVIVAL:
                return new SurvivalMode(options);
            case MODE_CONFIG.CLASSIC:
            default:
                return new ClassicMode(options);
        }
    }

    setup() {
        const previousState = this.storageManager.getGameState();

        if (previousState) {
            this.size = previousState.grid.size;
            this.grid = new Grid(this.size, previousState.grid.cells);
            this.score = previousState.score;
            this.over = previousState.over;
            this.won = previousState.won;
            this.isKeepPlaying = previousState.isKeepPlaying || previousState.keepPlaying;
            this.nextId = previousState.nextId || 0;
            this.timeRemaining = previousState.timeRemaining;
        } else {
            this.grid = new Grid(this.size);
            this.score = 0;
            this.over = false;
            this.won = false;
            this.isKeepPlaying = false;
            this.addStartTiles();
        }

        this.modeStrategy = this.createModeStrategy(this.gameMode);
        this.modeStrategy.init();

        this.actuator.setupGrid(this.size);
        this.actuator.updateSizeHighlight(this.size);
        this.actuator.updateModeHighlight(this.gameMode);
        this.actuate();
    }

    restart() {
        this.storageManager.clearGameState();
        this.history = [];
        this.actuator.continueGame();
        this.setup();
    }

    keepPlaying() {
        this.isKeepPlaying = true;
        this.actuator.continueGame();
    }

    isGameTerminated() {
        return this.over || (this.won && !this.isKeepPlaying);
    }

    addStartTiles() {
        for (let i = 0; i < this.startTiles; i++) {
            this.addRandomTile();
        }
    }

    addRandomTile() {
        if (this.grid.cellsAvailable()) {
            const value = Math.random() < (1 - GRID_CONFIG.PROBABILITY_FOUR) ? 2 : 4;
            const tile = new Tile(this.grid.randomAvailableCell(), value, this.nextId++);
            this.grid.insertTile(tile);
        }
    }

    actuate() {
        if (this.storageManager.getBestScore(this.size) < this.score) {
            this.storageManager.setBestScore(this.score, this.size);
        }

        const bestScore = this.storageManager.getBestScore(this.size);

        if (this.over) {
            this.storageManager.clearGameState();
        } else {
            this.storageManager.setGameState(this.serialize());
        }

        this.syncService.syncGameState(this.serialize(), bestScore);

        this.actuator.actuate(this.grid, {
            score: this.score,
            over: this.over,
            won: this.won,
            bestScore,
            terminated: this.isGameTerminated()
        });
    }

    serialize() {
        return {
            grid: this.grid.serialize(),
            score: this.score,
            over: this.over,
            won: this.won,
            isKeepPlaying: this.isKeepPlaying,
            nextId: this.nextId,
            timeRemaining: this.timeRemaining,
            gameMode: this.gameMode
        };
    }

    prepareTiles() {
        this.grid.eachCell((x, y, tile) => {
            if (tile) {
                tile.mergedFrom = null;
                tile.savePosition();
            }
        });
    }

    moveTile(tile, cell) {
        this.grid.cells[tile.x][tile.y] = null;
        this.grid.cells[cell.x][cell.y] = tile;
        tile.updatePosition(cell);
    }

    move(direction) {
        if (this.isGameTerminated()) return;

        const vector = this.getVector(direction);
        const traversals = this.buildTraversals(vector);
        let moved = false;
        const previousState = this.serialize();

        this.prepareTiles();

        traversals.x.forEach(x => {
            traversals.y.forEach(y => {
                const cell = { x, y };
                const tile = this.grid.cellContent(cell);

                if (tile) {
                    const positions = this.findFarthestPosition(cell, vector);
                    const next = this.grid.cellContent(positions.next);

                    if (next && next.value === tile.value && !next.mergedFrom) {
                        const merged = new Tile(positions.next, tile.value * 2, tile.id);
                        merged.mergedFrom = [tile, next];

                        this.grid.insertTile(merged);
                        this.grid.removeTile(tile);
                        tile.updatePosition(positions.next);

                        this.score += merged.value;

                        if (merged.value >= 512 && merged.value > tile.value) {
                            this.audioManager.playBonus();
                        } else {
                            this.audioManager.playMerge();
                        }

                        if (merged.value === GRID_CONFIG.WINNING_VALUE) {
                            this.won = true;
                            this.audioManager.playWin();
                        }
                    } else {
                        this.moveTile(tile, positions.farthest);
                    }

                    if (!this.positionsEqual(cell, tile)) {
                        moved = true;
                    }
                }
            });
        });

        if (moved) {
            this.audioManager.playSlide();

            if (this.modeStrategy) {
                this.modeStrategy.onMove(moved);
            }

            this.history.push(previousState);
            if (this.history.length > this.historyLimit) {
                this.history.shift();
            }

            this.addRandomTile();

            if (!this.movesAvailable()) {
                this.over = true;
                this.storageManager.addLeaderboard(this.score);
            }

            this.actuate();
        }
    }

    undo() {
        if (this.history.length === 0) return;

        const currentPositions = {};
        this.grid.eachCell((x, y, tile) => {
            if (tile) currentPositions[tile.id] = { x, y };
        });

        const state = this.history.pop();
        this.grid = new Grid(state.grid.size, state.grid.cells);

        this.grid.eachCell((x, y, tile) => {
            if (tile && currentPositions[tile.id]) {
                tile.previousPosition = currentPositions[tile.id];
            }
        });

        this.score = Math.max(0, this.score - GRID_CONFIG.UNDO_PENALTY);
        this.over = state.over;
        this.won = state.won;
        this.isKeepPlaying = state.isKeepPlaying;

        this.actuate();
    }

    static VECTORS = Object.freeze([
        Object.freeze({ x: 0, y: -1 }), // Up
        Object.freeze({ x: 1, y: 0 }),  // Right
        Object.freeze({ x: 0, y: 1 }),  // Down
        Object.freeze({ x: -1, y: 0 })  // Left
    ]);

    getVector(direction) {
        return GameManager.VECTORS[direction];
    }

    buildTraversals(vector) {
        const traversals = { x: [], y: [] };
        for (let pos = 0; pos < this.size; pos++) {
            traversals.x.push(pos);
            traversals.y.push(pos);
        }

        if (vector.x === 1) traversals.x = traversals.x.reverse();
        if (vector.y === 1) traversals.y = traversals.y.reverse();

        return traversals;
    }

    findFarthestPosition(cell, vector) {
        let previous;
        do {
            previous = cell;
            cell = { x: previous.x + vector.x, y: previous.y + vector.y };
        } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

        return {
            farthest: previous,
            next: cell
        };
    }

    movesAvailable() {
        return this.grid.cellsAvailable() || this.tileMatchesAvailable();
    }

    tileMatchesAvailable() {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                const tile = this.grid.cellContent({ x, y });
                if (tile) {
                    const right = this.grid.cellContent({ x: x + 1, y });
                    if (right && right.value === tile.value) return true;

                    const down = this.grid.cellContent({ x, y: y + 1 });
                    if (down && down.value === tile.value) return true;
                }
            }
        }
        return false;
    }

    positionsEqual(first, second) {
        return first.x === second.x && first.y === second.y;
    }

    // --- Setting and Event Helpers ---
    toggleProfile(tab = 'account-tab') {
        this.actuator.showProfileModal(tab);
    }

    toggleLeaderboard() {
        this.actuator.showProfileModal("global-leaderboard-tab");
    }

    toggleSettings() {
        this.actuator.toggleSettings();
        this.actuator.updateSizeHighlight(this.size);
    }

    closeModals() {
        this.actuator.closeModals();
    }

    toggleMute() {
        const isEnabled = this.audioManager.toggle();
        this.actuator.updateMuteButton(isEnabled);
    }

    applyLanguage() {
        this.actuator.updateLanguageHighlight(this.language);
        this.actuator.translateDOM(this.language);
    }

    changeLanguage(lang) {
        if (this.language === lang) return;
        this.language = lang;
        this.storageManager.setLanguage(lang);
        this.applyLanguage();
        this.actuate();
    }

    applyTheme() {
        const theme = this.storageManager.getItem(STORAGE_KEYS.THEME) || "light";
        this.actuator.setDarkMode(theme === "dark");
    }

    changeTheme() {
        const currentTheme = this.storageManager.getItem(STORAGE_KEYS.THEME) || "light";
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        this.storageManager.setItem(STORAGE_KEYS.THEME, newTheme);
        this.actuator.setDarkMode(newTheme === "dark");
    }

    changeSize(size) {
        if (size === this.size) return;
        const executeChange = () => {
            this.size = size;
            this.storageManager.setItem(STORAGE_KEYS.GRID_SIZE, size);
            this.restart();
        };

        if (!this.isGameTerminated() && this.score > 0) {
            this.actuator.showConfirm(t("confirmSizeChange", this.language), (confirmed) => {
                if (confirmed) executeChange();
                else this.actuator.updateSizeHighlight(this.size);
            });
        } else {
            executeChange();
        }
    }

    changeMode(mode) {
        if (mode === this.gameMode) return;
        const executeMode = () => {
            this.gameMode = mode;
            this.storageManager.setItem(STORAGE_KEYS.GAME_MODE, mode);
            this.restart();
        };

        if (!this.isGameTerminated() && this.score > 0) {
            this.actuator.showConfirm(t("confirmModeChange", this.language), (confirmed) => {
                if (confirmed) executeMode();
                else this.actuator.updateModeHighlight(this.gameMode);
            });
        } else {
            executeMode();
        }
    }

    changeSkin(skin) {
        if (skin === this.skin) return;
        this.skin = skin;
        this.storageManager.setItem(STORAGE_KEYS.SKIN, skin);
        this.actuator.updateSkinHighlight(this.skin);
        this.actuate();
    }
}
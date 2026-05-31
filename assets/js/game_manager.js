import Grid from "./grid.js";
import Tile from "./tile.js";
import { t } from "./i18n.js";

export default class GameManager {
    constructor(size, InputManager, Actuator, StorageManager, AudioManager) {
        this.storageManager = new StorageManager();
        this.size = this.storageManager.getItem("gridSize") || size; // Size of the grid
        this.gameMode = this.storageManager.getItem("gameMode") || "classic";
        this.skin = this.storageManager.getItem("skin") || "classic";
        this.language = this.storageManager.getLanguage();

        this.inputManager = new InputManager();
        this.actuator = new Actuator();
        this.audioManager = new AudioManager();

        this.startTiles = 2;
        this.history = [];
        this.historyLimit = 15;
        this.nextId = 0;
        this.timerInterval = null;

        this.inputManager.on("move", this.move.bind(this));
        this.inputManager.on("restart", this.restart.bind(this));
        this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));
        this.inputManager.on("undo", this.undo.bind(this));
        this.inputManager.on("changeSize", this.changeSize.bind(this));
        this.inputManager.on("changeMode", this.changeMode.bind(this));
        this.inputManager.on("changeSkin", this.changeSkin.bind(this));
        this.inputManager.on("changeTheme", this.changeTheme.bind(this));
        this.inputManager.on("changeLanguage", this.changeLanguage.bind(this));
        this.inputManager.on("toggleSettings", this.toggleSettings.bind(this));
        this.inputManager.on("toggleMute", this.toggleMute.bind(this));
        this.inputManager.on("toggleLeaderboard", this.toggleLeaderboard.bind(this));
        this.inputManager.on("toggleSaveLoad", this.toggleSaveLoad.bind(this));
        this.inputManager.on("closeModals", this.closeModals.bind(this));
        this.inputManager.on("saveSlot", this.saveSlot.bind(this));
        this.inputManager.on("loadSlot", this.loadSlot.bind(this));

        this.setup();
        this.applyTheme();
        this.applyLanguage();
        this.actuator.updateSkinHighlight(this.skin);
        this.actuator.updateModeHighlight(this.gameMode);
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
        
        // Re-render actuator elements that might be dynamic
        this.actuator.actuate(this.grid, {
            score: this.score,
            over: this.over,
            won: this.won,
            bestScore: this.storageManager.getBestScore(),
            terminated: this.isGameTerminated()
        });
    }

    toggleMute() {
        const isEnabled = this.audioManager.toggle();
        this.actuator.updateMuteButton(isEnabled);
    }

    applyTheme() {
        const theme = this.storageManager.getItem("theme") || "light";
        this.actuator.setDarkMode(theme === "dark");
    }

    changeTheme() {
        const currentTheme = this.storageManager.getItem("theme") || "light";
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        this.storageManager.setItem("theme", newTheme);
        this.actuator.setDarkMode(newTheme === "dark");
    }

    changeSize(size) {
        if (size === this.size) return;

        const executeChange = () => {
            this.size = size;
            this.storageManager.setItem("gridSize", size);
            this.restart();
        };

        if (!this.isGameTerminated() && this.score > 0) {
            this.actuator.showConfirm(t("confirmSizeChange", this.language), (confirmed) => {
                if (confirmed) {
                    executeChange();
                } else {
                    this.actuator.updateSizeHighlight(this.size);
                }
            });
        } else {
            executeChange();
        }
    }

    changeMode(mode) {
        if (mode === this.gameMode) return;

        const executeMode = () => {
            this.gameMode = mode;
            this.storageManager.setItem("gameMode", mode);
            this.restart();
        };

        if (!this.isGameTerminated() && this.score > 0) {
            this.actuator.showConfirm(t("confirmModeChange", this.language), (confirmed) => {
                if (confirmed) {
                    executeMode();
                } else {
                    this.actuator.updateModeHighlight(this.gameMode);
                }
            });
        } else {
            executeMode();
        }
    }

    changeSkin(skin) {
        if (skin === this.skin) return;
        this.skin = skin;
        this.storageManager.setItem("skin", skin);
        this.actuator.updateSkinHighlight(this.skin);
        this.actuate();
    }

    toggleSettings() {
        this.actuator.toggleSettings();
        this.actuator.updateSizeHighlight(this.size);
    }

    toggleLeaderboard() {
        const board = this.storageManager.getLeaderboard();
        this.actuator.showLeaderboard(board);
    }

    toggleSaveLoad() {
        const slotsData = {};
        [1, 2, 3].forEach(id => {
            slotsData[id] = this.storageManager.getGameSlotInfo(id);
        });
        this.actuator.showSaveLoad(slotsData);
    }

    closeModals() {
        this.actuator.closeModals();
    }

    saveSlot(slotId) {
        this.storageManager.saveGameSlot(slotId, this.serialize());
        this.toggleSaveLoad();
    }

    loadSlot(slotId) {
        const state = this.storageManager.loadGameSlot(slotId);
        if (state) {
            this.storageManager.setGameState(state);
            if (state.gameMode) {
                this.storageManager.setItem("gameMode", state.gameMode);
                this.gameMode = state.gameMode;
            }
            this.actuator.closeModals();
            this.actuator.continueGame(); // Clear won/keep playing messages
            this.setup();
        }
    }

    // Restart the game
    restart() {
        this.storageManager.clearGameState();
        this.history = [];
        this.actuator.continueGame(); // Clear the game won/lost message
        this.setup();
    }

    // Keep playing after winning (allows going over 2048)
    keepPlaying() {
        this.isKeepPlaying = true;
        this.actuator.continueGame(); // Clear the game won/lost message
    }

    // Return true if the game is lost, or has won and the user hasn't kept playing
    isGameTerminated() {
        return this.over || (this.won && !this.isKeepPlaying);
    }

    // Set up the game
    setup() {
        if (this.timerInterval) clearInterval(this.timerInterval);

        const previousState = this.storageManager.getGameState();

        // Reload the game from a previous game if present
        if (previousState) {
            this.size = previousState.grid.size; // Sync size with loaded state
            this.grid = new Grid(this.size, previousState.grid.cells); // Reload grid
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
            this.timeRemaining = this.gameMode === 'time' ? 60 : (this.gameMode === 'survival' ? 5 : null);

            // Add the initial tiles
            this.addStartTiles();
        }

        if (this.gameMode === 'time' || this.gameMode === 'survival') {
            if (!this.timeRemaining) this.timeRemaining = this.gameMode === 'time' ? 60 : 5;
            this.startTimer();
            this.actuator.updateTimer(this.timeRemaining, this.gameMode);
        } else {
            this.actuator.updateTimer(null, 'classic');
        }

        // Update the actuator
        this.actuator.setupGrid(this.size);
        this.actuator.updateSizeHighlight(this.size);
        this.actuator.updateModeHighlight(this.gameMode);
        this.actuate();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.isGameTerminated()) {
                clearInterval(this.timerInterval);
                return;
            }
            this.timeRemaining--;
            
            if (this.gameMode === 'time' && this.timeRemaining <= 0) {
                this.over = true;
                this.storageManager.addLeaderboard(this.score);
                clearInterval(this.timerInterval);
                this.actuate();
            } else if (this.gameMode === 'survival' && this.timeRemaining <= 0) {
                this.addRandomTile();
                this.timeRemaining = 5;
                if (!this.movesAvailable()) {
                    this.over = true;
                    this.storageManager.addLeaderboard(this.score);
                    clearInterval(this.timerInterval);
                }
                this.actuate();
            }
            this.actuator.updateTimer(this.timeRemaining, this.gameMode);
        }, 1000);
    }

    // Set up the initial tiles to start the game with
    addStartTiles() {
        for (let i = 0; i < this.startTiles; i++) {
            this.addRandomTile();
        }
    }

    // Adds a tile in a random position
    addRandomTile() {
        if (this.grid.cellsAvailable()) {
            const value = Math.random() < 0.9 ? 2 : 4;
            const tile = new Tile(this.grid.randomAvailableCell(), value, this.nextId++);

            this.grid.insertTile(tile);
        }
    }

    // Sends the updated grid to the actuator
    actuate() {
        if (this.storageManager.getBestScore(this.size) < this.score) {
            this.storageManager.setBestScore(this.score, this.size);
        }

        // Clear the state when the game is over (game over only, not win)
        if (this.over) {
            this.storageManager.clearGameState();
        } else {
            this.storageManager.setGameState(this.serialize());
        }

        this.actuator.actuate(this.grid, {
            score: this.score,
            over: this.over,
            won: this.won,
            bestScore: this.storageManager.getBestScore(this.size),
            terminated: this.isGameTerminated()
        });
    }

    // Represent the current game as an object
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

    // Save all tile positions and remove merger info
    prepareTiles() {
        this.grid.eachCell((x, y, tile) => {
            if (tile) {
                tile.mergedFrom = null;
                tile.savePosition();
            }
        });
    }

    // Move a tile and its representation
    moveTile(tile, cell) {
        this.grid.cells[tile.x][tile.y] = null;
        this.grid.cells[cell.x][cell.y] = tile;
        tile.updatePosition(cell);
    }

    // Move tiles on the grid in the specified direction
    move(direction) {
        // 0: up, 1: right, 2: down, 3: left
        if (this.isGameTerminated()) return; // Don't do anything if the game's over

        const vector = this.getVector(direction);
        const traversals = this.buildTraversals(vector);
        let moved = false;

        // Capture current state before move
        const previousState = this.serialize();

        // Save the current tile positions and remove merger information
        this.prepareTiles();

        // Traverse the grid in the right direction and move tiles
        traversals.x.forEach(x => {
            traversals.y.forEach(y => {
                const cell = { x, y };
                const tile = this.grid.cellContent(cell);

                if (tile) {
                    const positions = this.findFarthestPosition(cell, vector);
                    const next = this.grid.cellContent(positions.next);

                    // Only one merger per row traversal?
                    if (next && next.value === tile.value && !next.mergedFrom) {
                        const merged = new Tile(positions.next, tile.value * 2, tile.id); // Keep the ID of the moving tile
                        merged.mergedFrom = [tile, next];

                        this.grid.insertTile(merged);
                        this.grid.removeTile(tile);

                        // Converge the two tiles' positions
                        tile.updatePosition(positions.next);

                        // Update the score
                        this.score += merged.value;

                        // The mighty 2048 tile or bonus tiles
                        if (merged.value >= 512 && merged.value > tile.value) {
                            this.audioManager.playBonus();
                        } else {
                            this.audioManager.playMerge();
                        }

                        if (merged.value === 2048) {
                            this.won = true;
                            this.audioManager.playWin();
                        }
                    } else {
                        this.moveTile(tile, positions.farthest);
                    }

                    if (!this.positionsEqual(cell, tile)) {
                        moved = true; // The tile moved from its original cell!
                    }
                }
            });
        });

        if (moved) {
            // Play slide sound if no merge happened to overwrite it
            // (In a more complex implementation we'd track if ANY merge occurred, 
            // but WebAudio can handle overlapping sounds fine)
            this.audioManager.playSlide();

            if (this.gameMode === 'time') {
                this.timeRemaining = Math.min(60, this.timeRemaining + 1);
                this.actuator.updateTimer(this.timeRemaining, this.gameMode);
            }

            // Save to history
            this.history.push(previousState);
            if (this.history.length > this.historyLimit) {
                this.history.shift(); // Keep history within limit
            }

            this.addRandomTile();

            if (!this.movesAvailable()) {
                this.over = true; // Game over!
                this.storageManager.addLeaderboard(this.score);
            }

            this.actuate();
        }
    }

    undo() {
        if (this.history.length === 0) return;

        // Current tiles' positions to animate back FROM
        const currentPositions = {};
        this.grid.eachCell((x, y, tile) => {
            if (tile) {
                currentPositions[tile.id] = { x, y };
            }
        });

        const state = this.history.pop();

        this.grid = new Grid(state.grid.size, state.grid.cells);
        
        // Restore previous positions for animation
        this.grid.eachCell((x, y, tile) => {
            if (tile && currentPositions[tile.id]) {
                tile.previousPosition = currentPositions[tile.id];
            }
        });

        // Apply 100 point penalty for Undo
        this.score = Math.max(0, this.score - 100);
        
        this.over = state.over;
        this.won = state.won;
        this.isKeepPlaying = state.isKeepPlaying;

        this.actuate();
    }

    static VECTORS = Object.freeze([
        Object.freeze({ x: 0, y: -1 }), // Up
        Object.freeze({ x: 1, y: 0 }), // Right
        Object.freeze({ x: 0, y: 1 }), // Down
        Object.freeze({ x: -1, y: 0 }) // Left
    ]);

    // Get the vector representing the chosen direction
    getVector(direction) {
        return GameManager.VECTORS[direction];
    }

    // Build a list of positions to traverse in the right order
    buildTraversals(vector) {
        const traversals = { x: [], y: [] };

        for (let pos = 0; pos < this.size; pos++) {
            traversals.x.push(pos);
            traversals.y.push(pos);
        }

        // Always traverse from the farthest cell in the chosen direction
        if (vector.x === 1) traversals.x = traversals.x.reverse();
        if (vector.y === 1) traversals.y = traversals.y.reverse();

        return traversals;
    }

    findFarthestPosition(cell, vector) {
        let previous;

        // Progress towards the vector direction until an obstacle is found
        do {
            previous = cell;
            cell = { x: previous.x + vector.x, y: previous.y + vector.y };
        } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

        return {
            farthest: previous,
            next: cell // Used to check if a merge is required
        };
    }

    movesAvailable() {
        return this.grid.cellsAvailable() || this.tileMatchesAvailable();
    }

    // Check for available matches between tiles (more expensive check)
    tileMatchesAvailable() {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                const tile = this.grid.cellContent({ x, y });

                if (tile) {
                    // Only check right and down to avoid duplicate checks
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
}
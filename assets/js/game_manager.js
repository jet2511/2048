import Grid from "./grid.js";
import Tile from "./tile.js";

export default class GameManager {
    constructor(size, InputManager, Actuator, StorageManager) {
        this.storageManager = new StorageManager();
        this.size = this.storageManager.getItem("gridSize") || size; // Size of the grid
        this.inputManager = new InputManager();
        this.actuator = new Actuator();

        this.startTiles = 2;
        this.history = [];
        this.historyLimit = 15;
        this.nextId = 0;

        this.inputManager.on("move", this.move.bind(this));
        this.inputManager.on("restart", this.restart.bind(this));
        this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));
        this.inputManager.on("undo", this.undo.bind(this));
        this.inputManager.on("changeSize", this.changeSize.bind(this));
        this.inputManager.on("changeTheme", this.changeTheme.bind(this));
        this.inputManager.on("toggleSettings", this.toggleSettings.bind(this));
        this.inputManager.on("showStats", this.showStats.bind(this));
        this.inputManager.on("resetStats", this.resetStats.bind(this));

        this.setup();
        this.applyTheme();
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

        // Custom UI confirmation instead of blocking confirm()
        this.actuator.showConfirm("Dữ liệu hiện tại sẽ bị mất khi bạn đổi kích thước màn chơi. Bạn có chắc chắn muốn tiếp tục?", (confirmed) => {
            if (confirmed) {
                this.size = size;
                this.storageManager.setItem("gridSize", size);
                this.restart();
            } else {
                this.actuator.updateSizeHighlight(this.size);
            }
        });
    }

    toggleSettings() {
        this.actuator.toggleSettings();
        this.actuator.updateSizeHighlight(this.size);
    }

    showStats() {
        const stats = this.storageManager.getStats();
        const allStats = this.storageManager.getAllStats();
        this.actuator.showStats(stats, allStats, this.size);
    }

    resetStats(size = null) {
        const stats = this.storageManager.resetStats(size);
        const allStats = this.storageManager.getAllStats();
        this.actuator.updateStatsDisplay(stats, allStats);
    }

    // Track game end and update stats
    trackGameEnd(result) {
        let maxTile = 2;
        this.grid.eachCell((x, y, tile) => {
            if (tile && tile.value > maxTile) {
                maxTile = tile.value;
            }
        });
        
        this.storageManager.updateStats(result, this.score, maxTile, this.size);
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
        } else {
            this.grid = new Grid(this.size);
            this.score = 0;
            this.over = false;
            this.won = false;
            this.isKeepPlaying = false;

            // Add the initial tiles
            this.addStartTiles();
        }

        // Update the actuator
        this.actuator.setupGrid(this.size);
        this.actuator.updateSizeHighlight(this.size);
        this.actuate();
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

        // Track game end
        if (this.over) {
            this.trackGameEnd("lost");
        } else if (this.won && !this.isKeepPlaying) {
            this.trackGameEnd("won");
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
            nextId: this.nextId
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

                        // The mighty 2048 tile
                        if (merged.value === 2048) this.won = true;
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
            // Save to history
            this.history.push(previousState);
            if (this.history.length > this.historyLimit) {
                this.history.shift();
            }

            this.addRandomTile();

            if (!this.movesAvailable()) {
                this.over = true; // Game over!
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
        this.score = Math.max(0, state.score - 100);
        
        this.over = state.over;
        this.won = state.won;
        this.isKeepPlaying = state.isKeepPlaying;

        this.actuate();
    }

    // Get the vector representing the chosen direction
    getVector(direction) {
        // Vectors representing tile movement
        const map = {
            0: { x: 0, y: -1 }, // Up
            1: { x: 1, y: 0 }, // Right
            2: { x: 0, y: 1 }, // Down
            3: { x: -1, y: 0 } // Left
        };

        return map[direction];
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
                    for (let direction = 0; direction < 4; direction++) {
                        const vector = this.getVector(direction);
                        const cell = { x: x + vector.x, y: y + vector.y };
                        const other = this.grid.cellContent(cell);

                        if (other && other.value === tile.value) {
                            return true; // These two tiles can be merged
                        }
                    }
                }
            }
        }

        return false;
    }

    positionsEqual(first, second) {
        return first.x === second.x && first.y === second.y;
    }
}
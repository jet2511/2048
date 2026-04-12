export default class HTMLActuator {
    constructor() {
        this.tileContainer = document.querySelector(".tile-container");
        this.gridContainer = document.querySelector(".grid-container");
        this.settingsPanel = document.querySelector(".settings-panel");
        this.scoreContainer = document.querySelector(".score-container");
        this.bestContainer = document.querySelector(".best-container");
        this.messageContainer = document.querySelector(".game-message");
        this.sharingContainer = document.querySelector(".score-sharing");
        this.outerContainer = document.querySelector(".outerContainer");

        this.score = 0;
        this.size = 4; // Default size
        this.setupConfirmModal();
        this.setupStatsModal();
        
        // Listen for window resize to handle responsiveness
        window.addEventListener("resize", () => {
            this.updateCSSVars(this.size);
        });
    }

    setupConfirmModal() {
        this.confirmModal = document.createElement("div");
        this.confirmModal.classList.add("confirm-modal");
        
        const content = document.createElement("div");
        content.classList.add("confirm-content");
        
        const text = document.createElement("p");
        text.classList.add("confirm-text");
        
        const buttons = document.createElement("div");
        buttons.classList.add("confirm-buttons");
        
        const cancelBtn = document.createElement("a");
        cancelBtn.classList.add("confirm-button", "cancel");
        cancelBtn.textContent = "Hủy";
        
        const confirmBtn = document.createElement("a");
        confirmBtn.classList.add("confirm-button", "confirm");
        confirmBtn.textContent = "Tiếp tục";
        
        buttons.appendChild(cancelBtn);
        buttons.appendChild(confirmBtn);
        content.appendChild(text);
        content.appendChild(buttons);
        this.confirmModal.appendChild(content);
        
        this.outerContainer.appendChild(this.confirmModal);
        
        this.confirmCallback = null;
        
        cancelBtn.addEventListener("click", () => this.handleConfirm(false));
        confirmBtn.addEventListener("click", () => this.handleConfirm(true));
    }

    setupStatsModal() {
        this.statsModal = document.createElement("div");
        this.statsModal.classList.add("confirm-modal", "stats-modal");
        
        const content = document.createElement("div");
        content.classList.add("confirm-content", "stats-content");
        
        const title = document.createElement("h2");
        title.classList.add("stats-title");
        title.textContent = "Thống kê game";
        
        const sizeSelector = document.createElement("div");
        sizeSelector.classList.add("stats-size-selector");
        
        const sizeLabel = document.createElement("span");
        sizeLabel.classList.add("stats-size-label");
        sizeLabel.textContent = "Chế độ:";
        
        this.sizeDropdown = document.createElement("select");
        this.sizeDropdown.classList.add("stats-size-dropdown");
        
        const sizes = [
            { value: "4", label: "4x4" },
            { value: "3", label: "3x3" },
            { value: "5", label: "5x5" },
            { value: "6", label: "6x6" },
            { value: "total", label: "Tổng" }
        ];
        
        sizes.forEach(size => {
            const option = document.createElement("option");
            option.value = size.value;
            option.textContent = size.label;
            this.sizeDropdown.appendChild(option);
        });
        
        sizeSelector.appendChild(sizeLabel);
        sizeSelector.appendChild(this.sizeDropdown);
        
        const statsGrid = document.createElement("div");
        statsGrid.classList.add("stats-grid");
        
        this.statsItems = {
            totalGames: this.createStatItem("Tổng game", "0"),
            gamesWon: this.createStatItem("Thắng", "0"),
            gamesLost: this.createStatItem("Thua", "0"),
            winRate: this.createStatItem("Tỉ lệ thắng", "0%"),
            bestScore: this.createStatItem("Điểm cao nhất", "0"),
            bestTile: this.createStatItem("Tile cao nhất", "2")
        };
        
        Object.values(this.statsItems).forEach(item => statsGrid.appendChild(item));
        
        const buttons = document.createElement("div");
        buttons.classList.add("confirm-buttons");
        
        const resetBtn = document.createElement("a");
        resetBtn.classList.add("confirm-button", "reset-stats");
        resetBtn.textContent = "Reset";
        
        const closeBtn = document.createElement("a");
        closeBtn.classList.add("confirm-button", "close-stats");
        closeBtn.textContent = "Đóng";
        
        buttons.appendChild(resetBtn);
        buttons.appendChild(closeBtn);
        
        content.appendChild(title);
        content.appendChild(sizeSelector);
        content.appendChild(statsGrid);
        content.appendChild(buttons);
        this.statsModal.appendChild(content);
        
        this.outerContainer.appendChild(this.statsModal);
        
        this.currentStats = null;
        this.allStatsData = null;
        this.currentSize = 4;
        
        this.sizeDropdown.addEventListener("change", () => this.onSizeChange());
        
        closeBtn.addEventListener("click", () => this.closeStats());
        resetBtn.addEventListener("click", () => {
            const sizeToReset = this.currentSize === "total" ? null : parseInt(this.currentSize);
            window.dispatchEvent(new CustomEvent("resetStats", { detail: { size: sizeToReset } }));
        });
    }

    onSizeChange() {
        const selectedValue = this.sizeDropdown.value;
        this.currentSize = selectedValue;
        
        if (selectedValue === "total") {
            this.currentStats = this.calculateTotalStats(this.allStatsData);
        } else {
            this.currentStats = this.allStatsData[selectedValue] || this.getDefaultStats();
        }
        
        this.updateStatsDisplay(this.currentStats);
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

    getDefaultStats() {
        return {
            totalGames: 0,
            gamesWon: 0,
            gamesLost: 0,
            bestScore: 0,
            bestTile: 2
        };
    }

    createStatItem(label, value) {
        const item = document.createElement("div");
        item.classList.add("stat-item");
        
        const labelEl = document.createElement("span");
        labelEl.classList.add("stat-label");
        labelEl.textContent = label;
        
        const valueEl = document.createElement("span");
        valueEl.classList.add("stat-value");
        valueEl.textContent = value;
        
        item.appendChild(labelEl);
        item.appendChild(valueEl);
        
        return item;
    }

    showStats(stats, allStats, currentSize) {
        this.allStatsData = allStats;
        this.currentSize = currentSize.toString();
        
        this.sizeDropdown.value = this.currentSize;
        this.currentStats = stats;
        
        this.updateStatsDisplay(stats);
        this.statsModal.classList.add("is-open");
    }

    closeStats() {
        this.statsModal.classList.remove("is-open");
    }

    updateStatsDisplay(stats, allStats = null) {
        if (allStats) {
            this.allStatsData = allStats;
        }
        
        this.statsItems.totalGames.querySelector(".stat-value").textContent = stats.totalGames;
        this.statsItems.gamesWon.querySelector(".stat-value").textContent = stats.gamesWon;
        this.statsItems.gamesLost.querySelector(".stat-value").textContent = stats.gamesLost;
        
        const winRate = stats.totalGames > 0 ? Math.round((stats.gamesWon / stats.totalGames) * 100) : 0;
        this.statsItems.winRate.querySelector(".stat-value").textContent = winRate + "%";
        
        this.statsItems.bestScore.querySelector(".stat-value").textContent = stats.bestScore;
        this.statsItems.bestTile.querySelector(".stat-value").textContent = stats.bestTile;
    }

    showConfirm(message, callback) {
        this.confirmModal.querySelector(".confirm-text").textContent = message;
        this.confirmModal.classList.add("is-open");
        this.confirmCallback = callback;
    }

    handleConfirm(confirmed) {
        this.confirmModal.classList.remove("is-open");
        if (this.confirmCallback) {
            this.confirmCallback(confirmed);
            this.confirmCallback = null;
        }
    }

    toggleSettings() {
        this.settingsPanel.classList.toggle("is-open");
    }

    updateSizeHighlight(size) {
        const options = document.querySelectorAll(".size-option");
        options.forEach(opt => {
            if (parseInt(opt.getAttribute("data-size")) === size) {
                opt.classList.add("active");
            } else {
                opt.classList.remove("active");
            }
        });
    }

    // Set up the grid background based on size
    setupGrid(size) {
        this.size = size;
        this.clearContainer(this.gridContainer);

        for (let i = 0; i < size; i++) {
            const row = document.createElement("div");
            row.classList.add("grid-row");

            for (let j = 0; j < size; j++) {
                const cell = document.createElement("div");
                cell.classList.add("grid-cell");
                row.appendChild(cell);
            }

            this.gridContainer.appendChild(row);
        }

        this.updateCSSVars(size);
    }

    updateCSSVars(size) {
        const root = document.documentElement;
        const gameContainer = document.querySelector(".game-container");
        
        // Get the current width of the container on screen
        // If it's not visible yet (startup), it will fall back to base.css values
        const rect = gameContainer.getBoundingClientRect();
        const containerSize = rect.width > 0 ? rect.width : 500;
        
        // Match the spacing (varies by screen size but usually 15px or 10px on mobile)
        const spacing = window.innerWidth <= 520 ? 10 : 15;
        const tileSize = (containerSize - (spacing * (size + 1))) / size;

        root.style.setProperty('--grid-row-cells', size);
        root.style.setProperty('--tile-size', `${tileSize}px`);
        root.style.setProperty('--tile-margin', `${spacing}px`);
        root.style.setProperty('--game-container-size', `${containerSize}px`);
    }

    actuate(grid, metadata) {
        window.requestAnimationFrame(() => {
            this.clearContainer(this.tileContainer);

            grid.cells.forEach(column => {
                column.forEach(cell => {
                    if (cell) {
                        this.addTile(cell);
                    }
                });
            });

            this.updateScore(metadata.score);
            this.updateBestScore(metadata.bestScore);

            if (metadata.terminated) {
                if (metadata.over) {
                    this.message(false); // You lose
                } else if (metadata.won) {
                    this.message(true); // You win!
                }
            }
        });
    }

    // Continues the game (both restart and keep playing)
    continueGame() {
        this.clearMessage();
    }

    clearContainer(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    addTile(tile) {
        const wrapper = document.createElement("div");
        const inner = document.createElement("div");
        const position = tile.previousPosition || { x: tile.x, y: tile.y };
        
        wrapper.style.transform = this.getTranslate(position);

        // We can't use classlist because it somehow glitches when replacing classes
        const classes = ["tile", `tile-${tile.value}`];

        if (tile.value > 2048) classes.push("tile-super");

        this.applyClasses(wrapper, classes);

        inner.classList.add("tile-inner");
        inner.textContent = tile.value;

        if (tile.previousPosition) {
            // Make sure that the tile gets rendered in the previous position first
            window.requestAnimationFrame(() => {
                wrapper.style.transform = this.getTranslate({ x: tile.x, y: tile.y });
            });
        } else if (tile.mergedFrom) {
            classes.push("tile-merged");
            this.applyClasses(wrapper, classes);

            // Render the tiles that merged
            tile.mergedFrom.forEach(merged => {
                this.addTile(merged);
            });
        } else {
            classes.push("tile-new");
            this.applyClasses(wrapper, classes);
        }

        // Add the inner part of the tile to the wrapper
        wrapper.appendChild(inner);

        // Put the tile on the board
        this.tileContainer.appendChild(wrapper);
    }

    getTranslate(position) {
        const { x, y } = position;
        return `translate(calc(${x} * (var(--tile-size) + var(--tile-margin)) + var(--tile-margin)), calc(${y} * (var(--tile-size) + var(--tile-margin)) + var(--tile-margin)))`;
    }

    applyClasses(element, classes) {
        element.setAttribute("class", classes.join(" "));
    }

    updateScore(score) {
        this.clearContainer(this.scoreContainer);

        const difference = score - this.score;
        this.score = score;

        this.scoreContainer.textContent = this.score;

        if (difference > 0) {
            const addition = document.createElement("div");
            addition.classList.add("score-addition");
            addition.textContent = `+${difference}`;

            this.scoreContainer.appendChild(addition);

            // Clean up the addition element after the animation (approx 600ms)
            setTimeout(() => {
                if (addition.parentNode) {
                    addition.parentNode.removeChild(addition);
                }
            }, 600);
        }
    }

    updateBestScore(bestScore) {
        this.bestContainer.textContent = bestScore;
    }

    message(won) {
        const type = won ? "game-won" : "game-over";
        const message = won ? "You win!" : "Game over!";

        this.messageContainer.classList.add(type);
        this.messageContainer.querySelectorAll("p")[0].textContent = message;

        this.clearContainer(this.sharingContainer);
        this.sharingContainer.appendChild(this.scoreTweetButton());
    }

    clearMessage() {
        this.messageContainer.classList.remove("game-won");
        this.messageContainer.classList.remove("game-over");
    }

    setDarkMode(enabled) {
        const themeToggle = document.querySelector(".theme-toggle");
        if (enabled) {
            document.body.classList.add("dark-mode");
            if (themeToggle) themeToggle.textContent = "Light Mode";
        } else {
            document.body.classList.remove("dark-mode");
            if (themeToggle) themeToggle.textContent = "Dark Mode";
        }
    }

    scoreTweetButton() {
        const tweet = document.createElement("a");
        tweet.classList.add("twitter-share-button");
        tweet.setAttribute("href", "https://twitter.com/share");
        tweet.setAttribute("data-url", "https://jet2511.github.io/2048/");
        tweet.textContent = "Tweet";

        const text = `I scored ${this.score} points at 2048, a game where you join numbers to score high! #2048game`;
        tweet.setAttribute("data-text", text);

        return tweet;
    }
}
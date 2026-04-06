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
        this.setupConfirmModal();
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
        const spacing = 15; // px
        const containerSize = 500; // px
        const tileSize = (containerSize - (spacing * (size + 1))) / size;

        root.style.setProperty('--grid-row-cells', size);
        root.style.setProperty('--tile-size', `${tileSize}px`);
        root.style.setProperty('--tile-margin', `${spacing}px`);
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
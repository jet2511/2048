export default class HTMLActuator {
    constructor() {
        this.tileContainer = document.querySelector(".tile-container");
        this.gridContainer = document.querySelector(".grid-container");
        this.settingsPanel = document.querySelector(".settings-panel");
        this.scoreContainer = document.querySelector(".score-container");
        this.bestContainer = document.querySelector(".best-container");
        this.messageContainer = document.querySelector(".game-message");
        this.sharingContainer = document.querySelector(".score-sharing");

        this.score = 0;
    }

    toggleSettings() {
        this.settingsPanel.classList.toggle("is-open");
    }

    updateSizeHighlight(size) {
        var options = document.querySelectorAll(".size-option");
        options.forEach(function(opt) {
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

        for (var i = 0; i < size; i++) {
            var row = document.createElement("div");
            row.classList.add("grid-row");

            for (var j = 0; j < size; j++) {
                var cell = document.createElement("div");
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
        root.style.setProperty('--tile-size', tileSize + 'px');
        root.style.setProperty('--tile-margin', spacing + 'px');
    }

    actuate(grid, metadata) {
        var self = this;

        window.requestAnimationFrame(function() {
            self.clearContainer(self.tileContainer);

            grid.cells.forEach(function(column) {
                column.forEach(function(cell) {
                    if (cell) {
                        self.addTile(cell);
                    }
                });
            });

            self.updateScore(metadata.score);
            self.updateBestScore(metadata.bestScore);

            if (metadata.terminated) {
                if (metadata.over) {
                    self.message(false); // You lose
                } else if (metadata.won) {
                    self.message(true); // You win!
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
        var self = this;

        var wrapper = document.createElement("div");
        var inner = document.createElement("div");
        var position = tile.previousPosition || { x: tile.x, y: tile.y };
        
        wrapper.style.transform = this.getTranslate(position);

        // We can't use classlist because it somehow glitches when replacing classes
        var classes = ["tile", "tile-" + tile.value];

        if (tile.value > 2048) classes.push("tile-super");

        this.applyClasses(wrapper, classes);

        inner.classList.add("tile-inner");
        inner.textContent = tile.value;

        if (tile.previousPosition) {
            // Make sure that the tile gets rendered in the previous position first
            window.requestAnimationFrame(function() {
                wrapper.style.transform = self.getTranslate({ x: tile.x, y: tile.y });
            });
        } else if (tile.mergedFrom) {
            classes.push("tile-merged");
            this.applyClasses(wrapper, classes);

            // Render the tiles that merged
            tile.mergedFrom.forEach(function(merged) {
                self.addTile(merged);
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
        const x = position.x;
        const y = position.y;
        return `translate(calc(${x} * (var(--tile-size) + var(--tile-margin)) + var(--tile-margin)), calc(${y} * (var(--tile-size) + var(--tile-margin)) + var(--tile-margin)))`;
    }

    applyClasses(element, classes) {
        element.setAttribute("class", classes.join(" "));
    }

    updateScore(score) {
        this.clearContainer(this.scoreContainer);

        var difference = score - this.score;
        this.score = score;

        this.scoreContainer.textContent = this.score;

        if (difference > 0) {
            var addition = document.createElement("div");
            addition.classList.add("score-addition");
            addition.textContent = "+" + difference;

            this.scoreContainer.appendChild(addition);
        }
    }

    updateBestScore(bestScore) {
        this.bestContainer.textContent = bestScore;
    }

    message(won) {
        var type = won ? "game-won" : "game-over";
        var message = won ? "You win!" : "Game over!";

        this.messageContainer.classList.add(type);
        this.messageContainer.getElementsByTagName("p")[0].textContent = message;

        this.clearContainer(this.sharingContainer);
        this.sharingContainer.appendChild(this.scoreTweetButton());
    }

    clearMessage() {
        // IE only takes one value to remove at a time.
        this.messageContainer.classList.remove("game-won");
        this.messageContainer.classList.remove("game-over");
    }

    setDarkMode(enabled) {
        if (enabled) {
            document.body.classList.add("dark-mode");
            document.querySelector(".theme-toggle").textContent = "Light Mode";
        } else {
            document.body.classList.remove("dark-mode");
            document.querySelector(".theme-toggle").textContent = "Dark Mode";
        }
    }

    scoreTweetButton() {
        var tweet = document.createElement("a");
        tweet.classList.add("twitter-share-button");
        tweet.setAttribute("href", "https://twitter.com/share");
        tweet.setAttribute("data-url", "https://jet2511.github.io/2048/");
        tweet.textContent = "Tweet";

        var text = "I scored " + this.score + " points at 2048, a game where you join numbers to score high! #2048game";
        tweet.setAttribute("data-text", text);

        return tweet;
    }
}
export default class KeyboardInputManager {
    constructor() {
        this.events = {};

        this.eventTouchstart = "touchstart";
        this.eventTouchmove = "touchmove";
        this.eventTouchend = "touchend";

        this.listen();
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit(event, data) {
        const callbacks = this.events[event];
        if (callbacks) {
            callbacks.forEach(callback => {
                callback(data);
            });
        }
    }

    listen() {
        const map = {
            38: 0, // Up
            39: 1, // Right
            40: 2, // Down
            37: 3, // Left
            75: 0, // Vim up
            76: 1, // Vim right
            74: 2, // Vim down
            72: 3, // Vim left
            87: 0, // W
            68: 1, // D
            83: 2, // S
            65: 3 // A
        };

        // Respond to direction keys
        document.addEventListener("keydown", event => {
            const modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                event.shiftKey;
            const mapped = map[event.which];

            // Ignore the event if it's happening in a text field
            if (this.targetIsInput(event)) return;

            if (!modifiers) {
                if (mapped !== undefined) {
                    event.preventDefault();
                    this.emit("move", mapped);
                }
            }

            // R key restarts the game
            if (!modifiers && event.which === 82) {
                this.restart(event);
            }

            // Z or U key undos the move
            if (!modifiers && (event.which === 90 || event.which === 85)) {
                this.undo(event);
            }
        });

        // Respond to button presses
        this.bindButtonPress(".retry-button", this.restart.bind(this));
        this.bindButtonPress(".restart-button", this.restart.bind(this));
        this.bindButtonPress(".undo-button", this.undo.bind(this));
        this.bindButtonPress(".keep-playing-button", this.keepPlaying.bind(this));
        this.bindButtonPress(".theme-toggle", this.themeToggle.bind(this));
        this.bindButtonPress(".settings-toggle", this.settingsToggle.bind(this));
        this.bindButtonPress(".stats-button", this.statsToggle.bind(this));

        window.addEventListener("resetStats", (e) => {
            const size = e.detail?.size ?? null;
            this.emit("resetStats", size);
        });

        this.bindAll(".size-option", event => {
            const size = parseInt(event.target.getAttribute("data-size"));
            this.emit("changeSize", size);
        });

        // Respond to swipe events
        let touchStartClientX, touchStartClientY;
        const gameContainer = document.getElementsByClassName("game-container")[0];

        gameContainer.addEventListener(this.eventTouchstart, event => {
            if (event.touches.length > 1 ||
                event.targetTouches.length > 1 ||
                this.targetIsInput(event) ||
                this.targetIsLink(event)) {
                return; // Ignore if touching with more than 1 finger or touching input
            }

            touchStartClientX = event.touches[0].clientX;
            touchStartClientY = event.touches[0].clientY;

            event.preventDefault();
        });

        gameContainer.addEventListener(this.eventTouchmove, event => {
            event.preventDefault();
        });

        gameContainer.addEventListener(this.eventTouchend, event => {
            if (event.touches.length > 0 ||
                event.targetTouches.length > 0 ||
                this.targetIsInput(event) ||
                this.targetIsLink(event)) {
                return; // Ignore if still touching with one or more fingers or input
            }

            let touchEndClientX, touchEndClientY;

            touchEndClientX = event.changedTouches[0].clientX;
            touchEndClientY = event.changedTouches[0].clientY;

            const dx = touchEndClientX - touchStartClientX;
            const absDx = Math.abs(dx);

            const dy = touchEndClientY - touchStartClientY;
            const absDy = Math.abs(dy);

            if (Math.max(absDx, absDy) > 5) {
                // (right : left) : (down : up)
                this.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
            }
        });
    }

    restart(event) {
        event.preventDefault();
        this.emit("restart");
    }

    keepPlaying(event) {
        event.preventDefault();
        this.emit("keepPlaying");
    }

    undo(event) {
        event.preventDefault();
        this.emit("undo");
    }

    themeToggle(event) {
        event.preventDefault();
        this.emit("changeTheme");
    }

    settingsToggle(event) {
        event.preventDefault();
        this.emit("toggleSettings");
    }

    statsToggle(event) {
        event.preventDefault();
        this.emit("showStats");
    }

    bindAll(selector, fn) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.addEventListener("click", fn);
            element.addEventListener(this.eventTouchend, fn);
        });
    }

    bindButtonPress(selector, fn) {
        const button = document.querySelector(selector);
        if (button) {
            button.addEventListener("click", fn);
            button.addEventListener(this.eventTouchend, fn);
        }
    }

    targetIsInput(event) {
        return event.target.tagName.toLowerCase() === "input";
    }

    targetIsLink(event) {
        return event.target.tagName.toLowerCase() === "a";
    }
}
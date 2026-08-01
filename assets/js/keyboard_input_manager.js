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
            "ArrowUp": 0, // Up
            "ArrowRight": 1, // Right
            "ArrowDown": 2, // Down
            "ArrowLeft": 3, // Left
            "k": 0, "K": 0, // Vim up
            "l": 1, "L": 1, // Vim right
            "j": 2, "J": 2, // Vim down
            "h": 3, "H": 3, // Vim left
            "w": 0, "W": 0, // W
            "d": 1, "D": 1, // D
            "s": 2, "S": 2, // S
            "a": 3, "A": 3 // A
        };

        // Respond to direction keys
        document.addEventListener("keydown", event => {
            const modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                event.shiftKey;
            const mapped = map[event.key];

            // Ignore the event if it's happening in a text field
            if (this.targetIsInput(event)) return;

            if (!modifiers) {
                if (mapped !== undefined) {
                    event.preventDefault();
                    this.emit("move", mapped);
                }
            }

            // R key restarts the game
            if (!modifiers && (event.key === "r" || event.key === "R")) {
                this.restart(event);
            }

            // Z or U key undos the move
            if (!modifiers && (event.key === "z" || event.key === "Z" || event.key === "u" || event.key === "U")) {
                this.undo(event);
            }

            // Escape key closes modals
            if (event.key === "Escape") {
                this.emit("closeModals");
            }
        });

        // Click on modal overlay backdrop closes modal
        document.querySelectorAll(".modal-overlay").forEach(overlay => {
            overlay.addEventListener("click", event => {
                if (event.target === overlay) {
                    this.emit("closeModals");
                }
            });
        });

        // Respond to button presses
        this.bindButtonPress(".retry-button", this.restart.bind(this));
        this.bindButtonPress(".restart-button", this.restart.bind(this));
        this.bindButtonPress(".undo-button", this.undo.bind(this));
        this.bindButtonPress(".keep-playing-button", this.keepPlaying.bind(this));
        this.bindButtonPress(".theme-toggle", this.themeToggle.bind(this));
        this.bindButtonPress(".settings-toggle", this.settingsToggle.bind(this));
        this.bindButtonPress(".mute-toggle", this.muteToggle.bind(this));
        this.bindButtonPress(".profile-toggle", this.profileToggle.bind(this));
        this.bindButtonPress(".leaderboard-toggle", this.leaderboardToggle.bind(this));

        this.bindAll(".close-modal-btn", event => {
            event.preventDefault();
            this.emit("closeModals");
        });

        this.bindAll(".size-option", event => {
            event.preventDefault();
            const size = parseInt(event.target.getAttribute("data-size"));
            this.emit("changeSize", size);
        });

        this.bindAll(".mode-option", event => {
            event.preventDefault();
            const mode = event.target.getAttribute("data-mode");
            this.emit("changeMode", mode);
        });

        this.bindAll(".skin-option", event => {
            event.preventDefault();
            const skin = event.target.getAttribute("data-skin");
            this.emit("changeSkin", skin);
        });

        this.bindAll(".lang-option", event => {
            event.preventDefault();
            const lang = event.target.getAttribute("data-lang");
            this.emit("changeLanguage", lang);
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
                // Trigger haptic feedback if supported
                if (navigator.vibrate) {
                    navigator.vibrate(10);
                }
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

    muteToggle(event) {
        event.preventDefault();
        this.emit("toggleMute");
    }

    profileToggle(event) {
        event.preventDefault();
        this.emit("toggleProfile", "account-tab");
    }

    leaderboardToggle(event) {
        event.preventDefault();
        this.emit("toggleProfile", "global-leaderboard-tab");
    }

    bindAll(selector, fn) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.addEventListener("click", fn);
        });
    }

    bindButtonPress(selector, fn) {
        const button = document.querySelector(selector);
        if (button) {
            button.addEventListener("click", fn);
        }
    }

    destroy() {
        if (this.keydownHandler) {
            document.removeEventListener("keydown", this.keydownHandler);
        }
        if (this.gameContainer) {
            if (this.touchstartHandler) this.gameContainer.removeEventListener(this.eventTouchstart, this.touchstartHandler);
            if (this.touchmoveHandler) this.gameContainer.removeEventListener(this.eventTouchmove, this.touchmoveHandler);
            if (this.touchendHandler) this.gameContainer.removeEventListener(this.eventTouchend, this.touchendHandler);
        }
        this.events = {};
    }

    targetIsInput(event) {
        return event.target.tagName.toLowerCase() === "input";
    }

    targetIsLink(event) {
        return event.target.tagName.toLowerCase() === "a";
    }
}
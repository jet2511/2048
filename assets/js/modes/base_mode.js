/**
 * Base Strategy Class for Game Modes
 */
export default class BaseMode {
    /**
     * @param {object} options
     * @param {function} options.onTimeUpdate Callback when timer updates
     * @param {function} options.onTimeOut Callback when timer reaches 0
     */
    constructor(options = {}) {
        this.onTimeUpdate = options.onTimeUpdate || (() => {});
        this.onTimeOut = options.onTimeOut || (() => {});
        this.timeRemaining = 0;
        this.timer = null;
    }

    /**
     * Initialize the mode
     */
    init() {
        this.stopTimer();
    }

    /**
     * Called whenever a valid move occurs
     * @param {boolean} moved Whether any tile moved
     */
    onMove(moved) {}

    /**
     * Stop active countdown timer
     */
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.stopTimer();
    }
}

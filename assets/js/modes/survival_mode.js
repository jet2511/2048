import BaseMode from './base_mode.js';

/**
 * Survival Mode (Short countdown resetting per move)
 */
export default class SurvivalMode extends BaseMode {
    init() {
        super.init();
        this.timeRemaining = 15;
        this.startTimer();
    }

    startTimer() {
        this.stopTimer();
        this.onTimeUpdate(this.timeRemaining, 'survival');

        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.onTimeUpdate(this.timeRemaining, 'survival');

            if (this.timeRemaining <= 0) {
                this.stopTimer();
                this.onTimeOut();
            }
        }, 1000);
    }

    onMove(moved) {
        if (moved) {
            this.timeRemaining = 15;
            this.startTimer();
        }
    }
}

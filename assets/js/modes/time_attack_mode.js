import BaseMode from './base_mode.js';

/**
 * Time Attack Mode (60s timer + 1s bonus per move)
 */
export default class TimeAttackMode extends BaseMode {
    init() {
        super.init();
        this.timeRemaining = 60;
        this.onTimeUpdate(this.timeRemaining, 'time');

        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.onTimeUpdate(this.timeRemaining, 'time');

            if (this.timeRemaining <= 0) {
                this.stopTimer();
                this.onTimeOut();
            }
        }, 1000);
    }

    onMove(moved) {
        if (moved && this.timeRemaining > 0) {
            this.timeRemaining = Math.min(60, this.timeRemaining + 1);
            this.onTimeUpdate(this.timeRemaining, 'time');
        }
    }
}

import BaseMode from './base_mode.js';
import { MODE_CONFIG } from '../constants.js';

/**
 * Time Attack Mode (60s timer + 1s bonus per move)
 */
export default class TimeAttackMode extends BaseMode {
    init(initialTime) {
        super.init();
        const maxTime = MODE_CONFIG.TIME_ATTACK_INITIAL;
        this.timeRemaining = (typeof initialTime === 'number' && initialTime > 0) ? initialTime : maxTime;
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
            const maxTime = MODE_CONFIG.TIME_ATTACK_INITIAL;
            this.timeRemaining = Math.min(maxTime, this.timeRemaining + MODE_CONFIG.TIME_ATTACK_BONUS);
            this.onTimeUpdate(this.timeRemaining, 'time');
        }
    }
}

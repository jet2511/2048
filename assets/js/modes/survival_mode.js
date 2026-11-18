import BaseMode from './base_mode.js';
import { MODE_CONFIG } from '../constants.js';

/**
 * Survival Mode (Short countdown resetting per move)
 */
export default class SurvivalMode extends BaseMode {
    init(initialTime) {
        super.init();
        this.timeRemaining = (typeof initialTime === 'number' && initialTime > 0) 
            ? initialTime 
            : MODE_CONFIG.SURVIVAL_INITIAL;
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
            this.timeRemaining = MODE_CONFIG.SURVIVAL_INITIAL;
            this.startTimer();
        }
    }
}

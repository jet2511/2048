import BaseMode from './base_mode.js';

/**
 * Classic 2048 Mode (No time limit)
 */
export default class ClassicMode extends BaseMode {
    init() {
        super.init();
        this.onTimeUpdate(0, 'classic');
    }
}

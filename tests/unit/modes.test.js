import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ClassicMode from '../../assets/js/modes/classic_mode.js';
import SurvivalMode from '../../assets/js/modes/survival_mode.js';
import TimeAttackMode from '../../assets/js/modes/time_attack_mode.js';

describe('Game Modes Strategy Logic', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('ClassicMode should emit 0 time update on init', () => {
        const onTimeUpdate = vi.fn();
        const mode = new ClassicMode({ onTimeUpdate });
        mode.init();

        expect(onTimeUpdate).toHaveBeenCalledWith(0, 'classic');
    });

    it('SurvivalMode should countdown and trigger onTimeOut', () => {
        const onTimeUpdate = vi.fn();
        const onTimeOut = vi.fn();
        const mode = new SurvivalMode({ onTimeUpdate, onTimeOut });
        mode.init();

        expect(onTimeUpdate).toHaveBeenCalledWith(15, 'survival');

        // Advance 15 seconds
        vi.advanceTimersByTime(15000);

        expect(onTimeOut).toHaveBeenCalledTimes(1);
        mode.destroy();
    });

    it('SurvivalMode should reset timer on valid move', () => {
        const onTimeUpdate = vi.fn();
        const onTimeOut = vi.fn();
        const mode = new SurvivalMode({ onTimeUpdate, onTimeOut });
        mode.init();

        // Advance 10s
        vi.advanceTimersByTime(10000);
        expect(mode.timeRemaining).toBe(5);

        // Make move -> resets to 15s
        mode.onMove(true);
        expect(mode.timeRemaining).toBe(15);

        mode.destroy();
    });

    it('TimeAttackMode should countdown from 60s and add 1s bonus per move', () => {
        const onTimeUpdate = vi.fn();
        const onTimeOut = vi.fn();
        const mode = new TimeAttackMode({ onTimeUpdate, onTimeOut });
        mode.init();

        expect(onTimeUpdate).toHaveBeenCalledWith(60, 'time');

        // Advance 10s
        vi.advanceTimersByTime(10000);
        expect(mode.timeRemaining).toBe(50);

        // Move gives bonus +1s
        mode.onMove(true);
        expect(mode.timeRemaining).toBe(51);

        mode.destroy();
    });

    it('TimeAttackMode should resume from initialTime if provided', () => {
        const onTimeUpdate = vi.fn();
        const mode = new TimeAttackMode({ onTimeUpdate });
        mode.init(42);

        expect(mode.timeRemaining).toBe(42);
        expect(onTimeUpdate).toHaveBeenCalledWith(42, 'time');

        vi.advanceTimersByTime(2000);
        expect(mode.timeRemaining).toBe(40);
        mode.destroy();
    });

    it('SurvivalMode should resume from initialTime if provided', () => {
        const onTimeUpdate = vi.fn();
        const mode = new SurvivalMode({ onTimeUpdate });
        mode.init(9);

        expect(mode.timeRemaining).toBe(9);
        expect(onTimeUpdate).toHaveBeenCalledWith(9, 'survival');

        vi.advanceTimersByTime(3000);
        expect(mode.timeRemaining).toBe(6);
        mode.destroy();
    });
});

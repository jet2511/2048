import { describe, it, expect } from 'vitest';
import { t, translations } from '../../assets/js/i18n.js';

describe('i18n Translation Service', () => {
    it('should contain english and vietnamese dictionaries', () => {
        expect(translations.en).toBeDefined();
        expect(translations.vi).toBeDefined();
    });

    it('should translate keys correctly with default language (vi)', () => {
        expect(t('undo')).toBe('Hoàn tác');
        expect(t('newGame')).toBe('Chơi lại');
        expect(t('darkMode')).toBe('Nền tối');
    });

    it('should translate keys correctly for english', () => {
        expect(t('undo', 'en')).toBe('Undo');
        expect(t('newGame', 'en')).toBe('New Game');
        expect(t('darkMode', 'en')).toBe('Dark Mode');
    });

    it('should format arguments {0}, {1} accurately', () => {
        expect(t('slotScore', 'vi', 1, 2048, '2026-08-23')).toBe('Khe 1: 2048 điểm (2026-08-23)');
        expect(t('slotScore', 'en', 1, 2048, '2026-08-23')).toBe('Slot 1: Score 2048 (2026-08-23)');
    });

    it('should fallback to key or english when translation is missing', () => {
        expect(t('non_existent_key', 'vi')).toBe('non_existent_key');
    });
});

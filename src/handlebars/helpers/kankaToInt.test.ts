import { describe, expect, it } from 'vitest';
import kankaToInt from './kankaToInt';

describe('kankaToInt()', () => {
    it('returns an integer given a string', () => {
        expect(kankaToInt('5')).toBe(5);
    });

    it('returns 1 or 0 given a boolean', () => {
        expect(kankaToInt(true)).toBe(1);
        expect(kankaToInt(false)).toBe(0);
    });

    it('returns an integer given a number', () => {
        expect(kankaToInt(3)).toBe(3);
    });

    it('returns NaN given null or undefined', () => {
        expect(kankaToInt(null)).toBeNaN();
        expect(kankaToInt(undefined)).toBeNaN();
    });
});

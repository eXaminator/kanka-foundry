import { describe, expect, it } from 'vitest';
import kankaToInt from './kankaToInt';

describe('kankaToInt()', () => {
    it('returns an integer given a string', () => {
        expect(kankaToInt('5')).toBe(5);
    });
});

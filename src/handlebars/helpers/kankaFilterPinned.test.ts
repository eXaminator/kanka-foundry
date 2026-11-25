import { describe, expect, it } from 'vitest';
import kankaFilterPinned from './kankaFilterPinned';

describe('kankaFilterPinned()', () => {
    it('returns entries with is_pinned', () => {
        const data = [
            { id: 1, is_pinned: true },
            { id: 2, is_pinned: false },
        ];

        expect(kankaFilterPinned(data).map(({ id }) => id)).toEqual([1]);
    });

    it('prefers is_pinned over is_star', () => {
        const data = [
            { id: 1, is_pinned: false, is_star: true },
            { id: 2, is_pinned: true, is_star: false },
        ];

        expect(kankaFilterPinned(data).map(({ id }) => id)).toEqual([2]);
    });

    it('falls back to is_star for older snapshots', () => {
        const data = [
            { id: 1, is_star: true },
            { id: 2, is_star: false },
            { id: 3 },
        ];

        expect(kankaFilterPinned(data).map(({ id }) => id)).toEqual([1]);
    });

    it('returns an empty array without data', () => {
        expect(kankaFilterPinned(undefined)).toEqual([]);
    });
});

import { describe, expect, it } from 'vitest';
import getEntityStatus from './getEntityStatus';

describe('getEntityStatus()', () => {
    it('returns null if there is no snapshot', () => {
        expect(getEntityStatus(undefined)).toBeNull();
    });

    it('returns the status object of the API', () => {
        const status = { id: 3, key: 'dead', name: 'Dead', icon: 'fa-regular fa-skull', is_custom: false };

        expect(getEntityStatus({ status_id: 3, status })).toBe(status);
    });

    it('returns null if the API returned no status', () => {
        expect(getEntityStatus({ status_id: null, status: null, is_dead: true })).toBeNull();
    });

    it.each([
        ['is_dead', 'dead'],
        ['is_extinct', 'extinct'],
        ['is_destroyed', 'destroyed'],
        ['is_defunct', 'defunct'],
        ['is_completed', 'completed'],
    ])('derives the status from legacy flag %s', (flag, key) => {
        expect(getEntityStatus({ [flag]: true })).toMatchObject({ key, is_custom: false });
    });

    it('returns null if no legacy flag is set', () => {
        expect(getEntityStatus({ is_dead: false })).toBeNull();
    });
});

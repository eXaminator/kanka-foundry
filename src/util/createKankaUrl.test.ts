import { describe, it, expect } from 'vitest';
import createKankaUrl from './createKankaUrl';

describe('createKankaUrl()', () => {
    it('returns URL to campaign page', () => {
        const url = createKankaUrl(4711);
        expect(url).toEqual('https://kanka.io/en/campaign/4711');
    });

    it('returns URL to type overview page', () => {
        const url = createKankaUrl(4711, 'character');
        expect(url).toEqual('https://kanka.io/en/campaign/4711/characters');
    });

    it('returns URL to type overview page for abilities', () => {
        const url = createKankaUrl(4711, 'ability');
        expect(url).toEqual('https://kanka.io/en/campaign/4711/abilities');
    });

    it('returns URL to specific entity page', () => {
        const url = createKankaUrl(4711, 'ability', 12);
        expect(url).toEqual('https://kanka.io/en/campaign/4711/abilities/12');
    });

    it('returns URL to specific entity page with given locale', () => {
        const url = createKankaUrl(4711, 'ability', 12, 'de');
        expect(url).toEqual('https://kanka.io/de/campaign/4711/abilities/12');
    });
});

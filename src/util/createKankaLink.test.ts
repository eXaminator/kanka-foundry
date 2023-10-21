import { describe, it, expect } from 'vitest';
import createKankaLink from './createKankaLink';
import createKankaUrl from './createKankaUrl';

describe('createKankaLink()', () => {
    it('returns a link to the campaign page', () => {
        const expectedUrl = createKankaUrl(4711);
        const result = createKankaLink('Foobar', 4711);

        expect(result).toMatch(new RegExp(`<a.*href="${expectedUrl}".*>Foobar</a>`));
    });

    it('returns a link that opens in a new tab', () => {
        const result = createKankaLink('Foobar', 4711);

        expect(result).toMatch(/<a.*target="_blank".*>Foobar<\/a>/);
    });

    it('returns a link to a given entity', () => {
        const expectedUrl = createKankaUrl(4711, 'character', 12);
        const result = createKankaLink('Foobar', 4711, 'character', 12);

        expect(result).toMatch(new RegExp(`<a.*href="${expectedUrl}".*>Foobar</a>`));
    });

    it('returns a link with data attribute for given entity id', () => {
        const result = createKankaLink('Foobar', 4711, 'character', 12, 999);

        expect(result).toMatch(/<a.*data-id="999".*>/);
    });

    it('returns a link with additional css classes', () => {
        const result = createKankaLink('Foobar', 4711, 'character', 12, 999, 'foo bar');

        expect(result).toMatch(/<a.*class="foo bar".*>/);
    });
});

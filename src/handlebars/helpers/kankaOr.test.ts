import kankaOr from './kankaOr';

describe('kankaOr()', () => {
    let options: Handlebars.HelperOptions;

    beforeEach(() => {
        options = {
            hash: {},
            fn: () => '',
            inverse: () => '',
        };
    });

    it('returns true if all values are truthy', () => {
        expect(kankaOr(1, true, 'foo', options)).toBe(true);
    });

    it('returns true if one value is truthy', () => {
        expect(kankaOr(0, true, '', options)).toBe(true);
    });

    it('returns false if all values are falsey', () => {
        expect(kankaOr(0, false, '', options)).toBe(false);
    });
});

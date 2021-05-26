import kankaEq from './kankaEq';

describe('kankaEq()', () => {
    let options: Handlebars.HelperOptions;

    beforeEach(() => {
        options = {
            hash: {},
            fn: () => '',
            inverse: () => '',
        };
    });

    it('returns true if both values are strictly equal', () => {
        expect(kankaEq(5, 5, options)).toBe(true);
    });

    it('returns false if both values are different', () => {
        expect(kankaEq(0, '', options)).toBe(false);
    });

    it('returns false if both values strictly equal and the not-option was set', () => {
        expect(kankaEq(5, 5, { ...options, hash: { not: true } })).toBe(false);
    });

    it('returns true if both values are different and the not-option was set', () => {
        expect(kankaEq(0, '', { ...options, hash: { not: true } })).toBe(true);
    });
});

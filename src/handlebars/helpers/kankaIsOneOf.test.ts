import kankaIsOneOf from './kankaIsOneOf';

describe('kankaIsOneOf()', () => {
    let options: Handlebars.HelperOptions;

    beforeEach(() => {
        options = {
            hash: {},
            fn: () => '',
            inverse: () => '',
        };
    });

    it('returns true if first value is strictly equal to one of the others', () => {
        expect(kankaIsOneOf(5, 4, 5, 6, options)).toBe(true);
    });

    it('returns false if first value is not in rest arguments', () => {
        expect(kankaIsOneOf(0, 4, 5, 6, options)).toBe(false);
    });

    it('returns false if only one argument was provided', () => {
        expect(kankaIsOneOf(5, options)).toBe(false);
    });
});

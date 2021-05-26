import kankaToLowerCase from './kankaToLowerCase';

describe('kankaToLowerCase()', () => {
    it('returns the given string in lower case', () => {
        expect(kankaToLowerCase('FooBar')).toBe('foobar');
    });

    it('returns undefined if input is undefined', () => {
        expect(kankaToLowerCase(undefined)).toBeUndefined();
    });
});

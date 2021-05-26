import kankaSortBy from './kankaSortBy';

describe('kankaSortBy()', () => {
    let options: Handlebars.HelperOptions;

    beforeEach(() => {
        options = {
            hash: {},
            fn: () => '',
            inverse: () => '',
        };
    });

    it('sorts array by property', () => {
        const input = [
            { foo: 'd', bar: 'w' },
            { foo: 'a', bar: 'z' },
            { foo: 'c', bar: 'x' },
            { foo: 'b', bar: 'y' },
            { foo: 'c', bar: 'w' },
        ];

        const result = kankaSortBy(input, 'foo', options);

        expect(result).toEqual([
            { foo: 'a', bar: 'z' },
            { foo: 'b', bar: 'y' },
            { foo: 'c', bar: 'x' },
            { foo: 'c', bar: 'w' },
            { foo: 'd', bar: 'w' },
        ]);
    });

    it('sorts array by multiple properties', () => {
        const input = [
            { foo: 'd', bar: 'w' },
            { foo: 'a', bar: 'z' },
            { foo: 'c', bar: 'x' },
            { foo: 'b', bar: 'y' },
            { foo: 'c', bar: 'w' },
        ];

        const result = kankaSortBy(input, 'foo', 'bar', options);

        expect(result).toEqual([
            { foo: 'a', bar: 'z' },
            { foo: 'b', bar: 'y' },
            { foo: 'c', bar: 'w' },
            { foo: 'c', bar: 'x' },
            { foo: 'd', bar: 'w' },
        ]);
    });
});

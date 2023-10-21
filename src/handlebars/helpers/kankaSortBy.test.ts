import { beforeEach, describe, it, expect } from 'vitest';
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

    it('sorts array by numeric property', () => {
        const input = [
            { foo: 10, bar: 'w' },
            { foo: 1, bar: 'z' },
            { foo: 3, bar: 'x' },
            { foo: 2, bar: 'y' },
            { foo: 3, bar: 'w' },
        ];

        const result = kankaSortBy(input, 'foo', options);

        expect(result).toEqual([
            { foo: 1, bar: 'z' },
            { foo: 2, bar: 'y' },
            { foo: 3, bar: 'x' },
            { foo: 3, bar: 'w' },
            { foo: 10, bar: 'w' },
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

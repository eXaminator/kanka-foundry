import { describe, expect, it } from 'vitest';
import sortBy from './sortBy';

describe('sortBy()', () => {
    describe('sort function', () => {
        it('sorts array by property', () => {
            const input = [
                { foo: 'd', bar: 'w' },
                { foo: 'a', bar: 'z' },
                { foo: 'c', bar: 'x' },
                { foo: 'b', bar: 'y' },
                { foo: 'c', bar: 'w' },
            ];

            const result = [...input].sort(sortBy('foo'));

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

            const result = [...input].sort(sortBy('foo'));

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

            const result = [...input].sort(sortBy('foo', 'bar'));

            expect(result).toEqual([
                { foo: 'a', bar: 'z' },
                { foo: 'b', bar: 'y' },
                { foo: 'c', bar: 'w' },
                { foo: 'c', bar: 'x' },
                { foo: 'd', bar: 'w' },
            ]);
        });
    });
});

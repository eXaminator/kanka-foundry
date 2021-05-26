import kankaFilterBy from './kankaFilterBy';

describe('kankaFilterBy()', () => {
    it('returns filtered array based on given property', () => {
        const array = [
            { id: 1, foo: 'bar' },
            { id: 2, foo: 'baz' },
            { id: 3 },
            { id: 4, foo: 'bar' },
        ];

        const result = kankaFilterBy(array, 'foo', 'bar');

        expect(result).toHaveLength(2);
        expect(result).toEqual([
            { id: 1, foo: 'bar' },
            { id: 4, foo: 'bar' },
        ]);
    });
});

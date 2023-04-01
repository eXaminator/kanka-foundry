import groupBy from './groupBy';

describe('groupBy', () => {
    it('should group by key', () => {
        const array = [
            { type: 'a', value: 1 },
            { type: 'b', value: 2 },
            { type: 'a', value: 3 },
            { type: 'b', value: 4 },
            { type: 'a', value: 5 },
        ];
        const grouped = groupBy(array, 'type');

        expect(grouped.size).toBe(2);
        expect(grouped.get('a')).toEqual([
            { type: 'a', value: 1 },
            { type: 'a', value: 3 },
            { type: 'a', value: 5 },
        ]);
        expect(grouped.get('b')).toEqual([
            { type: 'b', value: 2 },
            { type: 'b', value: 4 },
        ]);
    });
});

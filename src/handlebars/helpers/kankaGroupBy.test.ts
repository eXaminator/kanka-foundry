import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import kankaGroupBy from './kankaGroupBy';

function compile(template: string, context = {}): string {
    return Handlebars.compile(template)(context);
}

describe('kankaGroupBy()', () => {
    beforeAll(() => {
        Handlebars.registerHelper('kankaGroupBy', kankaGroupBy);
    });

    afterAll(() => {
        Handlebars.unregisterHelper('kankaGroupBy');
    });

    it('returns a grouped object', () => {
        const array = [
            { id: 1, foo: 'bar' },
            { id: 2, foo: 'baz' },
            { id: 3, foo: 'bar' },
            { id: 4, foo: 'baz' },
            { id: 5, foo: 'baz' },
        ];

        const template = '{{#each (kankaGroupBy array "foo")}}{{@key}}: {{#each this}}{{id}},{{/each}}|{{/each}}';

        expect(compile(template, { array })).toEqual('bar: 1,3,|baz: 2,4,5,|');
    });

    it('returns empty group map if array is undefined', () => {
        const template = '{{#each (kankaGroupBy array "foo")}}{{@key}}: {{#each this}}{{id}},{{/each}}|{{/each}}';

        expect(compile(template)).toEqual('');
    });
});

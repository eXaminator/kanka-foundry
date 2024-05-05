import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import kankaFilterBy from './kankaFilterBy';

function compile(template: string, context = {}): string {
    return Handlebars.compile(template)(context);
}

describe('kankaFilterBy()', () => {
    beforeAll(() => {
        Handlebars.registerHelper('kankaFilterBy', kankaFilterBy as unknown as Handlebars.HelperDelegate);
    });

    afterAll(() => {
        Handlebars.unregisterHelper('kankaFilterBy');
    });

    it('returns filtered array based on given property', () => {
        const array = [{ id: 1, foo: 'bar' }, { id: 2, foo: 'baz' }, { id: 3 }, { id: 4, foo: 'bar' }];

        const template = '{{#each (kankaFilterBy array "foo" "bar")}}{{ id }},{{/each}}';

        expect(compile(template, { array })).toEqual('1,4,');
    });

    it('returns filtered array based on given property with inversion', () => {
        const array = [{ id: 1, foo: 'bar' }, { id: 2, foo: 'baz' }, { id: 3 }, { id: 4, foo: 'bar' }];

        const template = '{{#each (kankaFilterBy array "foo" "bar" true)}}{{ id }},{{/each}}';

        expect(compile(template, { array })).toEqual('2,3,');
    });

    it('returns filtered array based on given regex', () => {
        const array = [{ id: 1, foo: 'yes/bar' }, { id: 2, foo: 'yes/baz' }, { id: 3 }, { id: 4, foo: 'no/bar' }];

        const template = '{{#each (kankaFilterBy array "foo" "regex:^yes/")}}{{ id }},{{/each}}';

        expect(compile(template, { array })).toEqual('1,2,');
    });

    it('returns filtered array based on given regex with inversion', () => {
        const array = [{ id: 1, foo: 'yes/bar' }, { id: 2, foo: 'yes/baz' }, { id: 3 }, { id: 4, foo: 'no/bar' }];

        const template = '{{#each (kankaFilterBy array "foo" "regex:^yes/" true)}}{{ id }},{{/each}}';

        expect(compile(template, { array })).toEqual('3,4,');
    });

    it('returns unfiltered array if no property was given', () => {
        const array = [{ id: 1, foo: 'bar' }, { id: 2, foo: 'baz' }, { id: 3 }, { id: 4, foo: 'bar' }];

        const template = '{{#each (kankaFilterBy array)}}{{ id }},{{/each}}';

        expect(compile(template, { array })).toEqual('1,2,3,4,');
    });
});

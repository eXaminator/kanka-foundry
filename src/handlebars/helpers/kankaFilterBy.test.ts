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
        const array = [
            { id: 1, foo: 'bar' },
            { id: 2, foo: 'baz' },
            { id: 3 },
            { id: 4, foo: 'bar' },
        ];

        const template = '{{#each (kankaFilterBy array "foo" "bar")}}{{ id }},{{/each}}';

        expect(compile(template, { array })).toEqual('1,4,');
    });

    it('returns unfiltered array if no property was given', () => {
        const array = [
            { id: 1, foo: 'bar' },
            { id: 2, foo: 'baz' },
            { id: 3 },
            { id: 4, foo: 'bar' },
        ];

        const template = '{{#each (kankaFilterBy array)}}{{ id }},{{/each}}';

        expect(compile(template, { array })).toEqual('1,2,3,4,');
    });
});

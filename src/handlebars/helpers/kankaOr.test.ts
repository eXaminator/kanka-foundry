import kankaOr from './kankaOr';

function compile(template: string, context = {}): string {
    return Handlebars.compile(template)(context);
}

describe('kankaOr()', () => {
    beforeAll(() => {
        Handlebars.registerHelper('kankaOr', kankaOr);
    });

    afterAll(() => {
        Handlebars.unregisterHelper('kankaOr');
    });

    it('returns true if all values are truthy', () => {
        const template = '{{#if (kankaOr 1 true "foo")}}success{{/if}}';

        expect(compile(template)).toEqual('success');
    });

    it('returns true if one value is truthy', () => {
        const template = '{{#if (kankaOr 0 true "")}}success{{/if}}';

        expect(compile(template)).toEqual('success');
    });

    it('returns false if all values are falsey', () => {
        const template = '{{#unless (kankaOr 0 false "")}}success{{/unless}}';

        expect(compile(template)).toEqual('success');
    });
});

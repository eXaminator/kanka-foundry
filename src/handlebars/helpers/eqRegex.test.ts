import eqRegex from './eqRegex';

function compile(template: string, context = {}): string {
    return Handlebars.compile(template)(context);
}

describe('eqRegex()', () => {
    beforeAll(() => {
        Handlebars.registerHelper('eqRegex', eqRegex);
    });

    afterAll(() => {
        Handlebars.unregisterHelper('eqRegex');
    });

    it('returns true if value matches regex', () => {
        const template = '{{#if (eqRegex "foobar" "^foo")}}success{{/if}}';

        expect(compile(template)).toEqual('success');
    });

    it('returns false if value does not match regex', () => {
        const template = '{{#unless (eqRegex "foobar" "^baz")}}success{{/unless}}';

        expect(compile(template)).toEqual('success');
    });
});

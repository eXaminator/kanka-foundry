import kankaEq from './kankaEq';

function compile(template: string, context = {}): string {
    return Handlebars.compile(template)(context);
}

describe('kankaEq()', () => {
    beforeAll(() => {
        Handlebars.registerHelper('kankaEq', kankaEq);
    });

    afterAll(() => {
        Handlebars.unregisterHelper('kankaEq');
    });

    it('returns true if both values are strictly equal', () => {
        const template = '{{#if (kankaEq 5 5)}}success{{/if}}';

        expect(compile(template)).toEqual('success');
    });

    it('returns false if both values are different', () => {
        const template = '{{#unless (kankaEq 0 "0")}}success{{/unless}}';

        expect(compile(template)).toEqual('success');
    });

    it('returns false if both values strictly equal and the not-option is set', () => {
        const template = '{{#unless (kankaEq 0 0 not=true)}}success{{/unless}}';

        expect(compile(template)).toEqual('success');
    });

    it('returns true if both values are different and the not-option is set', () => {
        const template = '{{#if (kankaEq 0 "0" not=true)}}success{{/if}}';

        expect(compile(template)).toEqual('success');
    });

    it('returns true if first value matches regex of second value', () => {
        const template = '{{#if (kankaEq "foobar" "regex:^foo")}}success{{/if}}';

        expect(compile(template)).toEqual('success');
    });

    it('returns false if first value matches regex of second value and the not-option is set', () => {
        const template = '{{#unless (kankaEq "foobar" "regex:^foo" not=true)}}success{{/unless}}';

        expect(compile(template)).toEqual('success');
    });
});

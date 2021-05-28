import kankaIsOneOf from './kankaIsOneOf';

function compile(template: string, context = {}): string {
    return Handlebars.compile(template)(context);
}

describe('kankaIsOneOf()', () => {
    beforeAll(() => {
        Handlebars.registerHelper('kankaIsOneOf', kankaIsOneOf);
    });

    afterAll(() => {
        Handlebars.unregisterHelper('kankaIsOneOf');
    });

    it('returns true if first value is strictly equal to one of the others', () => {
        const template = '{{#if (kankaIsOneOf 5 4 5 6)}}success{{/if}}';

        expect(compile(template)).toEqual('success');
    });

    it('returns false if first value is not in rest arguments', () => {
        const template = '{{#unless (kankaIsOneOf 0 4 5 6)}}success{{/unless}}';

        expect(compile(template)).toEqual('success');
    });

    it('returns false if only one argument was provided', () => {
        const template = '{{#unless (kankaIsOneOf 5)}}success{{/unless}}';

        expect(compile(template)).toEqual('success');
    });
});

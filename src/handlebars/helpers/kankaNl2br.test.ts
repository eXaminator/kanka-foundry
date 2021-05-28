import kankaNl2br from './kankaNl2br';

function compile(template: string, context = {}): string {
    return Handlebars.compile(template)(context);
}

describe('kankaNl2br()', () => {
    beforeAll(() => {
        Handlebars.registerHelper('kankaNl2br', kankaNl2br);
    });

    afterAll(() => {
        Handlebars.unregisterHelper('kankaNl2br');
    });

    it('replaces all new lines by <br> tags', () => {
        const template = '{{ kankaNl2br "foo\nbar\r\nbaz" }}';

        expect(compile(template)).toEqual('foo<br />bar<br />baz');
    });
});

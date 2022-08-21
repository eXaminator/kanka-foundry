import kankaFileUrl from './kankaFileUrl';

function compile(template: string, context = {}): string {
    return Handlebars.compile(template)(context);
}

describe('kankaFileUrl()', () => {
    beforeAll(() => {
        Handlebars.registerHelper('kankaFileUrl', kankaFileUrl);
    });

    afterAll(() => {
        Handlebars.unregisterHelper('kankaFileUrl');
    });

    it('returns absolute url if relative url was passed', () => {
        const template = '{{ kankaFileUrl "/foo/bar" }}';

        expect(compile(template)).toEqual('https://kanka.io/foo/bar');
    });

    it('returns absolute url if relative url was passed without leading comma', () => {
        const template = '{{ kankaFileUrl "foo/bar" }}';

        expect(compile(template)).toEqual('https://kanka.io/foo/bar');
    });

    it('returns given url if it is already a full url with https protocol', () => {
        const template = '{{ kankaFileUrl "https://example.com/foo/bar" }}';

        expect(compile(template)).toEqual('https://example.com/foo/bar');
    });

    it('returns given url if it is already a full url with http protocol', () => {
        const template = '{{ kankaFileUrl "http://example.com/foo/bar" }}';

        expect(compile(template)).toEqual('http://example.com/foo/bar');
    });
});

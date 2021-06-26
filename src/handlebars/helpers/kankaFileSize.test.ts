import kankaFileSize from './kankaFileSize';

// No other choice then using an actual formatter for the tests, else tests might fail
// depending on whether the system the tests are running on (including CI) all use the same locale
const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

function compile(template: string, context = {}): string {
    return Handlebars.compile(template)(context);
}

describe('kankaFileSize()', () => {
    beforeAll(() => {
        Handlebars.registerHelper('kankaFileSize', kankaFileSize);
    });

    afterAll(() => {
        Handlebars.unregisterHelper('kankaFileSize');
    });

    it('returns correct string for 0 byte', () => {
        const template = '{{ kankaFileSize 0 }}';

        expect(compile(template)).toEqual('0 B');
    });

    it('returns correct string for 1000 byte', () => {
        const template = '{{ kankaFileSize 1000 }}';

        expect(compile(template)).toEqual(`${formatter.format(0.98)} KB`);
    });

    it('returns correct string for 1024 byte', () => {
        const template = '{{ kankaFileSize 1024 }}';

        expect(compile(template)).toEqual('1 KB');
    });

    it('returns correct string for 1.000.000 byte', () => {
        const template = '{{ kankaFileSize 1000000 }}';

        expect(compile(template)).toEqual(`${formatter.format(976.56)} KB`);
    });

    it('returns correct string for 1.048.576 byte', () => {
        const template = '{{ kankaFileSize 1048576 }}';

        expect(compile(template)).toEqual('1 MB');
    });

    it('returns correct string for 1.000.000.000 byte', () => {
        const template = '{{ kankaFileSize 1000000000 }}';

        expect(compile(template)).toEqual(`${formatter.format(953.67)} MB`);
    });

    it('returns correct string for 1.073.741.824 byte', () => {
        const template = '{{ kankaFileSize 1073741824 }}';

        expect(compile(template)).toEqual('1 GB');
    });

    it('returns correct string for 1.099.511.627.776 byte', () => {
        const template = '{{ kankaFileSize 1099511627776 }}';

        expect(compile(template)).toEqual(`${formatter.format(1024)} GB`);
    });
});

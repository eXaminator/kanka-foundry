import kankaFileIcon from './kankaFileIcon';

function compile(template: string, context = {}): string {
    return Handlebars.compile(template)(context);
}

const expectedIconClasses = new Map<string, string>([
    ['image/jpeg', 'fa-file-image'],
    ['image/png', 'fa-file-image'],
    ['image/gif', 'fa-file-image'],
    ['image/webp', 'fa-file-image'],
    ['audio/mpeg', 'fa-file-audio'],
    ['audio/ogg', 'fa-file-audio'],
    ['application/pdf', 'fa-file-pdf'],
    ['application/msexcel', 'fa-file-excel'],
    ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'fa-file-excel'],
    ['text/html', 'fa-file'],
    ['application/json', 'fa-file'],
    ['anything/else', 'fa-file'],
]);

describe('kankaFileIcon()', () => {
    beforeAll(() => {
        Handlebars.registerHelper('kankaFileIcon', kankaFileIcon as unknown as Handlebars.HelperDelegate);
    });

    afterAll(() => {
        Handlebars.unregisterHelper('kankaFileIcon');
    });

    expectedIconClasses.forEach((expectedCls, givenMime) => it(`returns ${expectedCls} icon for ${givenMime}`, () => {
        const template = '{{ kankaFileIcon givenMime }}';

        expect(compile(template, { givenMime })).toEqual(`<i class="fas ${expectedCls}"></i>`);
    }));
});

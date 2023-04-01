import kankaFileIcon from './kankaFileIcon';

function compile(template: string, context = {}): string {
    return Handlebars.compile(template)(context);
}

const expectedIconClasses = [
    { mime: 'image/jpeg', class: 'fa-file-image' },
    { mime: 'image/png', class: 'fa-file-image' },
    { mime: 'image/gif', class: 'fa-file-image' },
    { mime: 'image/webp', class: 'fa-file-image' },
    { mime: 'audio/mpeg', class: 'fa-file-audio' },
    { mime: 'audio/ogg', class: 'fa-file-audio' },
    { mime: 'application/pdf', class: 'fa-file-pdf' },
    { mime: 'application/msexcel', class: 'fa-file-excel' },
    { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', class: 'fa-file-excel' },
    { mime: 'text/html', class: 'fa-file' },
    { mime: 'application/json', class: 'fa-file' },
    { mime: 'anything/else', class: 'fa-file' },
];

describe('kankaFileIcon()', () => {
    beforeAll(() => {
        Handlebars.registerHelper('kankaFileIcon', kankaFileIcon as unknown as Handlebars.HelperDelegate);
    });

    afterAll(() => {
        Handlebars.unregisterHelper('kankaFileIcon');
    });

    it.each(expectedIconClasses)('returns $class icon for $mime', ({ mime, class: cls }) => {
        const template = '{{ kankaFileIcon mime }}';

        expect(compile(template, { mime })).toEqual(`<i class="fas ${String(cls)}"></i>`);
    });
});

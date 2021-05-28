/* eslint-disable @typescript-eslint/naming-convention */
import { KankaVisibility } from '../../types/kanka';
import kankaFilterAccessible from './kankaFilterAccessible';

function compile(template: string, context = {}): string {
    return Handlebars.compile(template)(context);
}

describe('kankaFilterAccessible()', () => {
    beforeAll(() => {
        Handlebars.registerHelper('kankaFilterAccessible', kankaFilterAccessible as unknown as Handlebars.HelperDelegate);
    });

    afterAll(() => {
        Handlebars.unregisterHelper('kankaFilterAccessible');
    });

    it('filters out all private entries', () => {
        const array = [
            { id: 1, foo: 'bar' },
            { id: 2, visibility: KankaVisibility.all },
            { id: 3, visibility: KankaVisibility.admin },
            { id: 4, visibility: KankaVisibility.adminSelf },
            { id: 5, visibility: KankaVisibility.members },
            { id: 6, visibility: KankaVisibility.self },
            { id: 7, is_private: false },
            { id: 8, is_private: true },
            { id: 9, isPrivate: false },
            { id: 10, isPrivate: true },
        ];

        const template = '{{#each (kankaFilterAccessible array)}}{{id}},{{/each}}';

        expect(compile(template, { array })).toEqual('1,2,5,7,9,');
    });

    it('returns unfiltered array if ignore option is given', () => {
        const array = [
            { id: 1, foo: 'bar' },
            { id: 2, visibility: KankaVisibility.all },
            { id: 3, visibility: KankaVisibility.admin },
            { id: 4, visibility: KankaVisibility.adminSelf },
            { id: 5, visibility: KankaVisibility.members },
            { id: 6, visibility: KankaVisibility.self },
            { id: 7, is_private: false },
            { id: 8, is_private: true },
            { id: 9, isPrivate: false },
            { id: 10, isPrivate: true },
        ];

        const template = '{{#each (kankaFilterAccessible array ignore=true)}}{{id}},{{/each}}';

        expect(compile(template, { array })).toEqual('1,2,3,4,5,6,7,8,9,10,');
    });

    it('returns unfiltered array if user is owner', () => {
        const array = [
            { id: 1, foo: 'bar' },
            { id: 2, visibility: KankaVisibility.all },
            { id: 3, visibility: KankaVisibility.admin },
            { id: 4, visibility: KankaVisibility.adminSelf },
            { id: 5, visibility: KankaVisibility.members },
            { id: 6, visibility: KankaVisibility.self },
            { id: 7, is_private: false },
            { id: 8, is_private: true },
            { id: 9, isPrivate: false },
            { id: 10, isPrivate: true },
        ];

        const template = '{{#each (kankaFilterAccessible array)}}{{id}},{{/each}}';

        expect(compile(template, { array, owner: true })).toEqual('1,2,3,4,5,6,7,8,9,10,');
    });
});

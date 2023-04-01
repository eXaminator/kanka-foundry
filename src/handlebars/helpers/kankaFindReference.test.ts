/* eslint-disable @typescript-eslint/naming-convention */
import { MockedFunction, vi } from 'vitest';
import Reference from '../../types/Reference';
import { KankaApiEntityId, KankaApiEntityType, KankaApiId } from '../../types/kanka';
import kankaFindReference from './kankaFindReference';
import kankaIsAccessible from './kankaIsAccessible';
import { findEntryByEntityId, findEntryByTypeAndChildId, getEntryFlag } from '../../module/journalEntries';

vi.mock('../../kanka');
vi.mock('./kankaIsAccessible');
vi.mock('../../module/journalEntries');

const mockedKankaIsAccessible = kankaIsAccessible as MockedFunction<typeof kankaIsAccessible>;

function compile(template: string, context = {}): string {
    return Handlebars.compile(template)(context);
}

function createReference(
    id: KankaApiId,
    entityId: KankaApiEntityId,
    type: KankaApiEntityType = 'character',
): Reference {
    return {
        id,
        entityId,
        type,
        name: 'Foobar',
        isPrivate: false,
        thumb: undefined,
        image: undefined,
    };
}

describe('kankaFindReference()', () => {
    beforeAll(() => {
        mockedKankaIsAccessible.mockReturnValue(true);
        vitest.mocked(getEntryFlag).mockImplementation((journal: any, flag) => journal?.flags?.[flag]);

        Handlebars.registerHelper('kankaFindReference', kankaFindReference);
    });

    afterAll(() => {
        Handlebars.unregisterHelper('kankaFindReference');
    });

    it('returns reference based on id from root context "kankaReferences"', () => {
        const references: Reference[] = [
            createReference(1, 4711),
        ];

        const template = '{{#with (kankaFindReference 4711)}}{{ id }}{{/with}}';

        expect(compile(template, { kankaReferences: references })).toEqual('1');
    });

    it('returns reference based on id and type from root context "kankaReferences"', () => {
        const references: Reference[] = [
            createReference(1, 4711, 'character'),
        ];

        const template = '{{#with (kankaFindReference 1 "character")}}{{ id }}{{/with}}';

        expect(compile(template, { kankaReferences: references })).toEqual('1');
    });

    it('returns reference based on id from given references', () => {
        const references: Reference[] = [
            createReference(1, 4711),
        ];

        const template = '{{#with (kankaFindReference 4711 references=references)}}{{ id }}{{/with}}';

        expect(compile(template, { references })).toEqual('1');
    });

    it('returns reference based on id and type from given references', () => {
        const references: Reference[] = [
            createReference(1, 4711, 'character'),
        ];

        const template = '{{#with (kankaFindReference 1 "character" references=references)}}{{ id }}{{/with}}';

        expect(compile(template, { references })).toEqual('1');
    });

    it('returns reference based on id created from existing journal entry with snapshot', () => {
        const snapshot = {
            id: 1,
            entity_id: 4711,
            name: 'Foobar',
            has_custom_image: false,
            is_private: false,
        };

        const journal = { id: 'foo-123', flags: { snapshot, type: 'character' }, getFlag: (_, name) => journal.flags[name] };
        vitest.mocked(findEntryByEntityId).mockReturnValue(journal as unknown as JournalEntry);

        const template = '{{#with (kankaFindReference 4711)}}{{ id }}, {{ name }}{{/with}}';

        expect(compile(template)).toEqual('1, Foobar');
        expect(findEntryByEntityId).toHaveBeenCalledWith(4711);
    });

    it('returns reference based on id and type created from existing journal entry with snapshot', () => {
        const snapshot = {
            id: 1,
            entity_id: 4711,
            name: 'Foobar',
            has_custom_image: false,
            is_private: false,
        };

        const journal = { id: 'foo-123', flags: { snapshot, type: 'character' } };
        vitest.mocked(findEntryByTypeAndChildId).mockReturnValue(journal as unknown as JournalEntry);

        const template = '{{#with (kankaFindReference 1 "character")}}{{ id }}, {{ name }}{{/with}}';

        expect(compile(template)).toEqual('1, Foobar');
        expect(findEntryByTypeAndChildId).toHaveBeenCalledWith('character', 1);
    });

    it('returns undefined if undefined id was given', () => {
        const template = '{{#with (kankaFindReference noId)}}{{ id }}{{else}}success{{/with}}';

        expect(compile(template)).toEqual('success');
    });

    it('returns undefined if reference is not accessible for user', () => {
        const references: Reference[] = [
            createReference(1, 4711),
        ];

        mockedKankaIsAccessible.mockReturnValue(false);

        const template = '{{#with (kankaFindReference 4711)}}{{ id }}{{else}}success{{/with}}';

        expect(compile(template, { kankaReferences: references })).toEqual('success');
    });

    it('returns undefined if no matching reference was found', () => {
        const template = '{{#with (kankaFindReference 4711)}}{{ id }}{{else}}success{{/with}}';

        expect(compile(template)).toEqual('success');
    });
});

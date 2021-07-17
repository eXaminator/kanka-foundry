/* eslint-disable @typescript-eslint/naming-convention */
import kanka from '../../kanka';
import type KankaJournalHelper from '../../module/KankaJournalHelper';
import { KankaApiEntityId, KankaApiEntityType, KankaApiId } from '../../types/kanka';
import Reference from '../../types/Reference';
import kankaFindReference from './kankaFindReference';
import kankaIsAccessible from './kankaIsAccessible';

jest.mock('../../kanka');
jest.mock('./kankaIsAccessible');

const mockedKankaIsAccessible = kankaIsAccessible as jest.Mock;

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
    let journals: jest.Mocked<KankaJournalHelper>;

    beforeAll(() => {
        journals = kanka.journals as jest.Mocked<KankaJournalHelper>;
        mockedKankaIsAccessible.mockReturnValue(true);

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

        const journal = { id: 'foo-123', flags: { snapshot, type: 'character' } };
        journals.findByEntityId.mockReturnValue(journal as unknown as JournalEntry);

        const template = '{{#with (kankaFindReference 4711)}}{{ id }}, {{ name }}{{/with}}';

        expect(compile(template)).toEqual('1, Foobar');
        expect(journals.findByEntityId).toHaveBeenCalledWith(4711);
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
        journals.findByTypeAndId.mockReturnValue(journal as unknown as JournalEntry);

        const template = '{{#with (kankaFindReference 1 "character")}}{{ id }}, {{ name }}{{/with}}';

        expect(compile(template)).toEqual('1, Foobar');
        expect(journals.findByTypeAndId).toHaveBeenCalledWith('character', 1);
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

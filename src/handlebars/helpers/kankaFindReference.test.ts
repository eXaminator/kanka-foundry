import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type Reference from '../../types/Reference';
import type { KankaApiEntityId, KankaApiModuleType, KankaApiId } from '../../types/kanka';
import kankaFindReference from './kankaFindReference';
import kankaIsAccessible from './kankaIsAccessible';

vi.mock('./kankaIsAccessible');
vi.mock('../../foundry/journalEntries');

function compile(template: string, context = {}): string {
    return Handlebars.compile(template)(context);
}

function createReference(
    id: KankaApiId,
    entityId: KankaApiEntityId,
    type: KankaApiModuleType = 'character',
): Reference {
    return {
        id,
        entityId,
        type,
        name: 'Foobar',
        isPrivate: false,
        thumb: undefined,
        image: undefined,
        urls: {
            view: 'http://app.kanka.com/w/4711/entities/1234',
            api: 'http://api.kanka.com/campaign/4711/characters/1234',
        },
    };
}

describe('kankaFindReference()', () => {
    beforeAll(() => {
        vi.mocked(kankaIsAccessible).mockReturnValue(true);

        Handlebars.registerHelper('kankaFindReference', kankaFindReference);
    });

    afterAll(() => {
        Handlebars.unregisterHelper('kankaFindReference');
    });

    it('returns reference based on id from root context "kankaReferences"', () => {
        const references: Reference[] = [createReference(1, 4711)];

        const template = '{{#with (kankaFindReference 4711)}}{{ id }}{{/with}}';

        expect(compile(template, { data: { system: { references } } })).toEqual('1');
    });

    it('returns reference based on id and type from root context "kankaReferences"', () => {
        const references: Reference[] = [createReference(1, 4711, 'character')];

        const template = '{{#with (kankaFindReference 1 "character")}}{{ id }}{{/with}}';

        expect(compile(template, { data: { system: { references } } })).toEqual('1');
    });

    it('returns reference based on id from given references', () => {
        const references: Reference[] = [createReference(1, 4711)];

        const template = '{{#with (kankaFindReference 4711 references=references)}}{{ id }}{{/with}}';

        expect(compile(template, { references })).toEqual('1');
    });

    it('returns reference based on id and type from given references', () => {
        const references: Reference[] = [createReference(1, 4711, 'character')];

        const template = '{{#with (kankaFindReference 1 "character" references=references)}}{{ id }}{{/with}}';

        expect(compile(template, { references })).toEqual('1');
    });

    it('returns undefined if undefined id was given', () => {
        const template = '{{#with (kankaFindReference noId)}}{{ id }}{{else}}success{{/with}}';

        expect(compile(template)).toEqual('success');
    });

    it('returns undefined if reference is not accessible for user', () => {
        const references: Reference[] = [createReference(1, 4711)];

        vi.mocked(kankaIsAccessible).mockReturnValue(false);

        const template = '{{#with (kankaFindReference 4711)}}{{ id }}{{else}}success{{/with}}';

        expect(compile(template, { data: { system: { references } } })).toEqual('success');
    });

    it('returns undefined if no matching reference was found', () => {
        const template = '{{#with (kankaFindReference 4711)}}{{ id }}{{else}}success{{/with}}';

        expect(compile(template)).toEqual('success');
    });
});

import { describe, expect, it, vi } from 'vitest';
import api from '..';
import type {
    KankaApiAbilityLink,
    KankaApiEntity,
    KankaApiEntityId,
    KankaApiModuleType,
    KankaApiId,
    KankaApiInventory,
    KankaApiJournal,
    KankaApiRelation,
} from '../../types/kanka';
import JournalTypeLoader from './JournalTypeLoader';

vi.mock('../../api/KankaApi');

function createJournal(data: Partial<KankaApiJournal> = {}): KankaApiJournal {
    return {
        relations: [],
        inventory: [],
        entity_abilities: [],
        entity_events: [],
        parents: [],
        children: [],
        ...data,
    } as KankaApiJournal;
}

function createEntity(entityId: KankaApiEntityId, childId: KankaApiId, type: KankaApiModuleType): KankaApiEntity {
    return {
        module: {
            code: type,
            id: 1,
            singular: type,
            plural: type,
        },
        type: 'Some type',
        id: entityId,
        child_id: childId,
        name: 'Foobar',
        updated_at: '',
        created_at: '',
        is_private: false,
        campaign_id: 4711,
        created_by: 1,
        updated_by: 1,
        is_template: false,
        child: {
            has_custom_image: false,
        },
        urls: {
            view: 'http://app.kanka.com/w/4711/entities/1234',
            api: 'http://api.kanka.com/campaign/4711/journals/1234',
        },
    };
}

describe('JournalTypeLoader', () => {
    describe('getType()', () => {
        it('returns the correct type', () => {
            const loader = new JournalTypeLoader();

            expect(loader.getType()).toEqual('journal');
        });
    });

    describe('load()', () => {
        it('returns result of getJournal', async () => {
            const expectedResult = createJournal();
            const loader = new JournalTypeLoader();
            vi.mocked(api).getJournal.mockResolvedValue(expectedResult);

            const result = await loader.load(4711, 12);

            expect(api.getJournal).toHaveBeenCalledWith(4711, 12);
            expect(result).toBe(expectedResult);
        });
    });

    describe('loadAll()', () => {
        it('returns result of getAllJournals', async () => {
            const expectedResult = [createJournal()];
            const loader = new JournalTypeLoader();
            vi.mocked(api).getAllJournals.mockResolvedValue(expectedResult);

            const result = await loader.loadAll(4711);

            expect(api.getAllJournals).toHaveBeenCalledWith(4711);
            expect(result).toBe(expectedResult);
        });
    });

    describe('createReferenceCollection()', () => {
        it('includes relations from the lookup array', async () => {
            const expectedResult = createJournal({
                relations: [{ target_id: 1002 } as KankaApiRelation],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'character'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new JournalTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'character',
                },
            });
        });

        it('includes inventory from the lookup array', async () => {
            const expectedResult = createJournal({
                inventory: [{ item_id: 2002 } as KankaApiInventory],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'item'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new JournalTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'item',
                },
            });
        });

        it('includes entity_abilities from the lookup array', async () => {
            const expectedResult = createJournal({
                entity_abilities: [{ ability_id: 2002 } as KankaApiAbilityLink],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'ability'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new JournalTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'ability',
                },
            });
        });

        it('includes parents from the lookup array', async () => {
            const expectedResult = createJournal({
                parents: [2002],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'journal'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new JournalTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'journal',
                },
            });
        });

        it('includes children from the lookup array', async () => {
            const expectedResult = createJournal({
                children: [2002],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'journal'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new JournalTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'journal',
                },
            });
        });

        it('includes parent from the lookup array', async () => {
            const expectedResult = createJournal({
                journal_id: 2002,
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'journal'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new JournalTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'journal',
                },
            });
        });

        it('includes location from the lookup array', async () => {
            const expectedResult = createJournal({
                location_id: 2002,
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'location'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new JournalTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'location',
                },
            });
        });

        it('includes character from the lookup array', async () => {
            const expectedResult = createJournal({
                character_id: 2002,
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'character'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new JournalTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'character',
                },
            });
        });
    });
});

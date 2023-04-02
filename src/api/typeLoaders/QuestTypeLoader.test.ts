/* eslint-disable @typescript-eslint/naming-convention */
import { vi } from 'vitest';
import {
    KankaApiAbilityLink,
    KankaApiEntity,
    KankaApiEntityId,
    KankaApiEntityType,
    KankaApiId,
    KankaApiInventory,
    KankaApiQuest,
    KankaApiQuestElement,
    KankaApiRelation,
} from '../../types/kanka';
import api from '..';
import QuestTypeLoader from './QuestTypeLoader';

vi.mock('../../api/KankaApi');

function createQuest(data: Partial<KankaApiQuest> = {}): KankaApiQuest {
    return {
        relations: [],
        inventory: [],
        entity_abilities: [],
        ancestors: [],
        children: [],
        elements: [],
        ...data,
    } as KankaApiQuest;
}

function createEntity(entityId: KankaApiEntityId, childId: KankaApiId, type: KankaApiEntityType): KankaApiEntity {
    return {
        type,
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
    };
}

describe('QuestTypeLoader', () => {
    describe('getType()', () => {
        it('returns the correct type', () => {
            const loader = new QuestTypeLoader();

            expect(loader.getType()).toEqual('quest');
        });
    });

    describe('load()', () => {
        it('returns result of getQuest', async () => {
            const expectedResult = createQuest();
            const loader = new QuestTypeLoader();
            vi.mocked(api).getQuest.mockResolvedValue(expectedResult);

            const result = await loader.load(4711, 12);

            expect(api.getQuest).toHaveBeenCalledWith(4711, 12);
            expect(result).toBe(expectedResult);
        });
    });

    describe('loadAll()', () => {
        it('returns result of getAllQuests', async () => {
            const expectedResult = [createQuest()];
            const loader = new QuestTypeLoader();
            vi.mocked(api).getAllQuests.mockResolvedValue(expectedResult);

            const result = await loader.loadAll(4711);

            expect(api.getAllQuests).toHaveBeenCalledWith(4711);
            expect(result).toBe(expectedResult);
        });
    });

    describe('createReferenceCollection()', () => {
        it('includes relations from the lookup array', async () => {
            const expectedResult = createQuest({
                relations: [{ target_id: 1002 } as KankaApiRelation],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'character'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new QuestTypeLoader();
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
            const expectedResult = createQuest({
                inventory: [{ item_id: 2002 } as KankaApiInventory],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'item'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new QuestTypeLoader();
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
            const expectedResult = createQuest({
                entity_abilities: [{ ability_id: 2002 } as KankaApiAbilityLink],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'ability'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new QuestTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'ability',
                },
            });
        });

        it('includes ancestors from the lookup array', async () => {
            const expectedResult = createQuest({
                ancestors: [1002],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'quest'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new QuestTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'quest',
                },
            });
        });

        it('includes children from the lookup array', async () => {
            const expectedResult = createQuest({
                children: [{ entity_id: 1002 }],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'quest'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new QuestTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'quest',
                },
            });
        });

        it('includes parent from the lookup array', async () => {
            const expectedResult = createQuest({
                quest_id: 2002,
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'quest'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new QuestTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'quest',
                },
            });
        });

        it('includes character from the lookup array', async () => {
            const expectedResult = createQuest({
                character_id: 2002,
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'character'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new QuestTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'character',
                },
            });
        });

        it('includes quest elements from the lookup array', async () => {
            const expectedResult = createQuest({
                elements: [{ entity_id: 1002 } as KankaApiQuestElement],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'character'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new QuestTypeLoader();
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

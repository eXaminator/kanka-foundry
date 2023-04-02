/* eslint-disable @typescript-eslint/naming-convention */
import { vi } from 'vitest';
import {
    KankaApiAbilityLink,
    KankaApiEntity,
    KankaApiEntityId,
    KankaApiEntityType,
    KankaApiId,
    KankaApiInventory,
    KankaApiItem,
    KankaApiRelation,
} from '../../types/kanka';
import api from '..';
import ItemTypeLoader from './ItemTypeLoader';

vi.mock('../../api/KankaApi');

function createItem(data: Partial<KankaApiItem> = {}): KankaApiItem {
    return {
        relations: [],
        inventory: [],
        entity_abilities: [],
        ancestors: [],
        children: [],
        ...data,
    } as KankaApiItem;
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

describe('ItemTypeLoader', () => {
    describe('getType()', () => {
        it('returns the correct type', () => {
            const loader = new ItemTypeLoader();

            expect(loader.getType()).toEqual('item');
        });
    });

    describe('load()', () => {
        it('returns result of getItem', async () => {
            const expectedResult = createItem();
            const loader = new ItemTypeLoader();
            vi.mocked(api).getItem.mockResolvedValue(expectedResult);

            const result = await loader.load(4711, 12);

            expect(api.getItem).toHaveBeenCalledWith(4711, 12);
            expect(result).toBe(expectedResult);
        });
    });

    describe('loadAll()', () => {
        it('returns result of getAllItems', async () => {
            const expectedResult = [createItem()];
            const loader = new ItemTypeLoader();
            vi.mocked(api).getAllItems.mockResolvedValue(expectedResult);

            const result = await loader.loadAll(4711);

            expect(api.getAllItems).toHaveBeenCalledWith(4711);
            expect(result).toBe(expectedResult);
        });
    });

    describe('createReferenceCollection()', () => {
        it('includes relations from the lookup array', async () => {
            const expectedResult = createItem({
                relations: [{ target_id: 1002 } as KankaApiRelation],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'character'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new ItemTypeLoader();
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
            const expectedResult = createItem({
                inventory: [{ item_id: 2002 } as KankaApiInventory],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'item'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new ItemTypeLoader();
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
            const expectedResult = createItem({
                entity_abilities: [{ ability_id: 2002 } as KankaApiAbilityLink],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'ability'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new ItemTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'ability',
                },
            });
        });

        it('includes location from the lookup array', async () => {
            const expectedResult = createItem({
                location_id: 2002,
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'location'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new ItemTypeLoader();
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
            const expectedResult = createItem({
                character_id: 2002,
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'character'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new ItemTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'character',
                },
            });
        });

        it('includes ancestors from the lookup array', async () => {
            const expectedResult = createItem({
                ancestors: [1002],
            });

            const entities = [
                createEntity(1001, 2001, 'item'),
                createEntity(1002, 2002, 'item'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new ItemTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'item',
                },
            });
        });

        it('includes children from the lookup array', async () => {
            const expectedResult = createItem({
                children: [{ entity_id: 1002 }],
            });

            const entities = [
                createEntity(1001, 2001, 'item'),
                createEntity(1002, 2002, 'item'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new ItemTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'item',
                },
            });
        });
    });
});

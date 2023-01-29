/* eslint-disable @typescript-eslint/naming-convention */
import { vi } from 'vitest';
import {
    KankaApiAbilityLink,
    KankaApiEntity,
    KankaApiEntityId,
    KankaApiEntityType,
    KankaApiFamily,
    KankaApiId,
    KankaApiInventory,
    KankaApiRelation,
} from '../../types/kanka';
import api from '../api';
import FamilyTypeLoader from './FamilyTypeLoader';

vi.mock('../../api/KankaApi');

function createFamily(data: Partial<KankaApiFamily> = {}): KankaApiFamily {
    return {
        members: [],
        ancestors: [],
        children: [],
        relations: [],
        inventory: [],
        entity_abilities: [],
        ...data,
    } as KankaApiFamily;
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

describe('FamilyTypeLoader', () => {
    describe('getType()', () => {
        it('returns the correct type', () => {
            const loader = new FamilyTypeLoader();

            expect(loader.getType()).toEqual('family');
        });
    });

    describe('load()', () => {
        it('returns result of getFamily', async () => {
            const expectedResult = createFamily();
            const loader = new FamilyTypeLoader();
            vi.mocked(api).getFamily.mockResolvedValue(expectedResult);

            const result = await loader.load(4711, 12);

            expect(api.getFamily).toHaveBeenCalledWith(4711, 12);
            expect(result).toBe(expectedResult);
        });
    });

    describe('loadAll()', () => {
        it('returns result of getAllFamilies', async () => {
            const expectedResult = [createFamily()];
            const loader = new FamilyTypeLoader();
            vi.mocked(api).getAllFamilies.mockResolvedValue(expectedResult);

            const result = await loader.loadAll(4711);

            expect(api.getAllFamilies).toHaveBeenCalledWith(4711);
            expect(result).toBe(expectedResult);
        });
    });

    describe('createReferenceCollection()', () => {
        it('includes relations from the lookup array', async () => {
            const expectedResult = createFamily({
                relations: [{ target_id: 1002 } as KankaApiRelation],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'character'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new FamilyTypeLoader();
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
            const expectedResult = createFamily({
                inventory: [{ item_id: 2002 } as KankaApiInventory],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'item'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new FamilyTypeLoader();
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
            const expectedResult = createFamily({
                entity_abilities: [{ ability_id: 2002 } as KankaApiAbilityLink],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'ability'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new FamilyTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'ability',
                },
            });
        });

        it('includes parent from the lookup array', async () => {
            const expectedResult = createFamily({
                family_id: 2002,
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'family'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new FamilyTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'family',
                },
            });
        });

        it('includes ancestors from the lookup array', async () => {
            const expectedResult = createFamily({
                ancestors: [1002],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'family'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new FamilyTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'family',
                },
            });
        });

        it('includes children from the lookup array', async () => {
            const expectedResult = createFamily({
                children: [{ entity_id: 1002 }],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'family'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new FamilyTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'family',
                },
            });
        });

        it('includes members from the lookup array', async () => {
            const expectedResult = createFamily({
                members: [2002],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'character'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new FamilyTypeLoader();
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

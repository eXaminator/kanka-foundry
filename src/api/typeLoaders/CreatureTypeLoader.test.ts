import { describe, expect, it, vi } from 'vitest';
import api from '..';
import type {
    KankaApiAbilityLink,
    KankaApiCreature,
    KankaApiEntity,
    KankaApiEntityId,
    KankaApiEntityType,
    KankaApiId,
    KankaApiInventory,
    KankaApiRelation,
} from '../../types/kanka';
import CreatureTypeLoader from './CreatureTypeLoader';

vi.mock('../../api/KankaApi');

function createCreature(data: Partial<KankaApiCreature> = {}): KankaApiCreature {
    return {
        relations: [],
        inventory: [],
        entity_abilities: [],
        entity_events: [],
        parents: [],
        children: [],
        locations: [],
        ...data,
    } as KankaApiCreature;
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
        urls: {
            view: 'http://app.kanka.com/w/4711/entities/1234',
            api: 'http://api.kanka.com/campaign/4711/creatures/1234',
        },
    };
}

describe('CreatureTypeLoader', () => {
    describe('getType()', () => {
        it('returns the correct type', () => {
            const loader = new CreatureTypeLoader();

            expect(loader.getType()).toEqual('creature');
        });
    });

    describe('load()', () => {
        it('returns result of getCreature', async () => {
            const expectedResult = createCreature();
            const loader = new CreatureTypeLoader();
            vi.mocked(api).getCreature.mockResolvedValue(expectedResult);

            const result = await loader.load(4711, 12);

            expect(api.getCreature).toHaveBeenCalledWith(4711, 12);
            expect(result).toBe(expectedResult);
        });
    });

    describe('loadAll()', () => {
        it('returns result of getAllCreatures', async () => {
            const expectedResult = [createCreature()];
            const loader = new CreatureTypeLoader();
            vi.mocked(api).getAllCreatures.mockResolvedValue(expectedResult);

            const result = await loader.loadAll(4711);

            expect(api.getAllCreatures).toHaveBeenCalledWith(4711);
            expect(result).toBe(expectedResult);
        });
    });

    describe('createReferenceCollection()', () => {
        it('includes relations from the lookup array', async () => {
            const expectedResult = createCreature({
                relations: [{ target_id: 1002 } as KankaApiRelation],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'character'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new CreatureTypeLoader();
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
            const expectedResult = createCreature({
                inventory: [{ item_id: 2002 } as KankaApiInventory],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'item'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new CreatureTypeLoader();
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
            const expectedResult = createCreature({
                entity_abilities: [{ ability_id: 2002 } as KankaApiAbilityLink],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'ability'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new CreatureTypeLoader();
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
            const expectedResult = createCreature({
                parents: [2002],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'creature'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new CreatureTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'creature',
                },
            });
        });

        it('includes children from the lookup array', async () => {
            const expectedResult = createCreature({
                children: [2002],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'creature'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new CreatureTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'creature',
                },
            });
        });

        it('includes parent from the lookup array', async () => {
            const expectedResult = createCreature({
                creature_id: 2002,
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'creature'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new CreatureTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'creature',
                },
            });
        });

        it('includes locations from the lookup array', async () => {
            const expectedResult = createCreature({
                locations: [2001, 2004],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'creature'),
                createEntity(1003, 2003, 'quest'),
                createEntity(1004, 2004, 'location'),
            ];

            const loader = new CreatureTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1001: {
                    id: 2001,
                    entityId: 1001,
                    type: 'location',
                },
                1004: {
                    id: 2004,
                    entityId: 1004,
                    type: 'location',
                },
            });
        });
    });
});

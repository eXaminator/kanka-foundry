/* eslint-disable @typescript-eslint/naming-convention */
import { MockedObject, vi } from 'vitest';
import KankaApi from '../../api/KankaApi';
import {
    KankaApiAbilityLink,
    KankaApiEntity,
    KankaApiEntityId,
    KankaApiEntityType,
    KankaApiId,
    KankaApiInventory,
    KankaApiRace,
    KankaApiRelation,
} from '../../types/kanka';
import RaceTypeLoader from './RaceTypeLoader';

vi.mock('../../api/KankaApi');

function createRace(data: Partial<KankaApiRace> = {}): KankaApiRace {
    return {
        relations: [],
        inventory: [],
        entity_abilities: [],
        ancestors: [],
        children: [],
        ...data,
    } as KankaApiRace;
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

describe('RaceTypeLoader', () => {
    let api: MockedObject<KankaApi>;

    beforeEach(() => {
        api = vi.mocked(new KankaApi());
    });

    describe('getType()', () => {
        it('returns the correct type', () => {
            const loader = new RaceTypeLoader(api);

            expect(loader.getType()).toEqual('race');
        });
    });

    describe('load()', () => {
        it('returns result of getRace', async () => {
            const expectedResult = createRace();
            const loader = new RaceTypeLoader(api);
            api.getRace.mockResolvedValue(expectedResult);

            const result = await loader.load(4711, 12);

            expect(api.getRace).toHaveBeenCalledWith(4711, 12);
            expect(result).toBe(expectedResult);
        });
    });

    describe('loadAll()', () => {
        it('returns result of getAllRaces', async () => {
            const expectedResult = [createRace()];
            const loader = new RaceTypeLoader(api);
            api.getAllRaces.mockResolvedValue(expectedResult);

            const result = await loader.loadAll(4711);

            expect(api.getAllRaces).toHaveBeenCalledWith(4711);
            expect(result).toBe(expectedResult);
        });
    });

    describe('createReferenceCollection()', () => {
        it('includes relations from the lookup array', async () => {
            const expectedResult = createRace({
                relations: [{ target_id: 1002 } as KankaApiRelation],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'character'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new RaceTypeLoader(api);
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
            const expectedResult = createRace({
                inventory: [{ item_id: 2002 } as KankaApiInventory],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'item'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new RaceTypeLoader(api);
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
            const expectedResult = createRace({
                entity_abilities: [{ ability_id: 2002 } as KankaApiAbilityLink],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'ability'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new RaceTypeLoader(api);
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
            const expectedResult = createRace({
                ancestors: [1002],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'race'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new RaceTypeLoader(api);
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'race',
                },
            });
        });

        it('includes children from the lookup array', async () => {
            const expectedResult = createRace({
                children: [{ entity_id: 1002 }],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'race'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new RaceTypeLoader(api);
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'race',
                },
            });
        });

        it('includes parent from the lookup array', async () => {
            const expectedResult = createRace({
                race_id: 2002,
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'race'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new RaceTypeLoader(api);
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'race',
                },
            });
        });
    });
});

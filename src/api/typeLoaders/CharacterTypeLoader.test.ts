import { describe, expect, it, vi } from 'vitest';
import api from '..';
import type {
    KankaApiAbilityLink,
    KankaApiCharacter,
    KankaApiCharacterOrganisationLink,
    KankaApiEntity,
    KankaApiEntityId,
    KankaApiModuleType,
    KankaApiId,
    KankaApiInventory,
    KankaApiRelation,
} from '../../types/kanka';
import CharacterTypeLoader from './CharacterTypeLoader';

vi.mock('../../api/KankaApi');

function createCharacter(data: Partial<KankaApiCharacter> = {}): KankaApiCharacter {
    return {
        organisations: { data: [] },
        relations: [],
        inventory: [],
        entity_abilities: [],
        reminders: [],
        ...data,
    } as KankaApiCharacter;
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
            api: 'http://api.kanka.com/campaign/4711/characters/1234',
        },
    };
}

describe('CharacterTypeLoader', () => {
    describe('getType()', () => {
        it('returns the correct type', () => {
            const loader = new CharacterTypeLoader();

            expect(loader.getType()).toEqual('character');
        });
    });

    describe('load()', () => {
        it('returns result of getCharacter', async () => {
            const expectedResult = createCharacter();
            const loader = new CharacterTypeLoader();
            vi.mocked(api).getCharacter.mockResolvedValue(expectedResult);

            const result = await loader.load(4711, 12);

            expect(api.getCharacter).toHaveBeenCalledWith(4711, 12);
            expect(result).toMatchObject(expectedResult);
        });

        it('normalizes race_id to races array', async () => {
            const expectedResult = createCharacter({ race_id: 42 });
            const loader = new CharacterTypeLoader();
            vi.mocked(api).getCharacter.mockResolvedValue(expectedResult);

            const result = await loader.load(4711, 12);

            expect(result.races).toEqual([42]);
        });

        it('normalizes family_id to families array', async () => {
            const expectedResult = createCharacter({ family_id: 42 });
            const loader = new CharacterTypeLoader();
            vi.mocked(api).getCharacter.mockResolvedValue(expectedResult);

            const result = await loader.load(4711, 12);

            expect(result.families).toEqual([42]);
        });

        it('normalizes location_id to locations array', async () => {
            const expectedResult = createCharacter({ location_id: 42 });
            const loader = new CharacterTypeLoader();
            vi.mocked(api).getCharacter.mockResolvedValue(expectedResult);

            const result = await loader.load(4711, 12);

            expect(result.locations).toEqual([42]);
        });
    });

    describe('loadAll()', () => {
        it('returns result of getAllCharacters', async () => {
            const expectedResult = [createCharacter()];
            const loader = new CharacterTypeLoader();
            vi.mocked(api).getAllCharacters.mockResolvedValue(expectedResult);

            const result = await loader.loadAll(4711);

            expect(api.getAllCharacters).toHaveBeenCalledWith(4711);
            expect(result).toMatchObject(expectedResult);
        });

        it('normalizes old single-ID fields to arrays for all characters', async () => {
            const expectedResult = [
                createCharacter({ race_id: 42, family_id: 10, location_id: 5 }),
            ];
            const loader = new CharacterTypeLoader();
            vi.mocked(api).getAllCharacters.mockResolvedValue(expectedResult);

            const result = await loader.loadAll(4711);

            expect(result[0].races).toEqual([42]);
            expect(result[0].families).toEqual([10]);
            expect(result[0].locations).toEqual([5]);
        });
    });

    describe('createReferenceCollection()', () => {
        it('includes relations from the lookup array', async () => {
            const expectedResult = createCharacter({
                relations: [{ target_id: 1002 } as KankaApiRelation],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'character'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new CharacterTypeLoader();
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
            const expectedResult = createCharacter({
                inventory: [{ item_id: 2002 } as KankaApiInventory],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'item'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new CharacterTypeLoader();
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
            const expectedResult = createCharacter({
                entity_abilities: [{ ability_id: 2002 } as KankaApiAbilityLink],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'ability'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new CharacterTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'ability',
                },
            });
        });

        it('includes organisations from the lookup array', async () => {
            const expectedResult = createCharacter({
                organisations: { data: [{ organisation_id: 2002 } as KankaApiCharacterOrganisationLink] },
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'organisation'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new CharacterTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'organisation',
                },
            });
        });

        it('includes locations from the lookup array', async () => {
            const expectedResult = createCharacter({
                locations: [2001, 2004],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'character'),
                createEntity(1003, 2003, 'quest'),
                createEntity(1004, 2004, 'location'),
            ];

            const loader = new CharacterTypeLoader();
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

        it('includes races from the lookup array', async () => {
            const expectedResult = createCharacter({
                races: [2002],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'race'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new CharacterTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'race',
                },
            });
        });

        it('includes families from the lookup array', async () => {
            const expectedResult = createCharacter({
                families: [2002],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'family'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new CharacterTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'family',
                },
            });
        });
    });
});

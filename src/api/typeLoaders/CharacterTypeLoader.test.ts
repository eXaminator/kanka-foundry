/* eslint-disable @typescript-eslint/naming-convention */
import { vi } from 'vitest';
import {
    KankaApiAbilityLink,
    KankaApiCharacter,
    KankaApiCharacterOrganisationLink,
    KankaApiEntity,
    KankaApiEntityId,
    KankaApiEntityType,
    KankaApiId,
    KankaApiInventory,
    KankaApiRelation,
} from '../../types/kanka';
import api from '..';
import CharacterTypeLoader from './CharacterTypeLoader';

vi.mock('../../api/KankaApi');

function createCharacter(data: Partial<KankaApiCharacter> = {}): KankaApiCharacter {
    return {
        organisations: { data: [] },
        relations: [],
        inventory: [],
        entity_abilities: [],
        ...data,
    } as KankaApiCharacter;
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
            expect(result).toBe(expectedResult);
        });
    });

    describe('loadAll()', () => {
        it('returns result of getAllCharacters', async () => {
            const expectedResult = [createCharacter()];
            const loader = new CharacterTypeLoader();
            vi.mocked(api).getAllCharacters.mockResolvedValue(expectedResult);

            const result = await loader.loadAll(4711);

            expect(api.getAllCharacters).toHaveBeenCalledWith(4711);
            expect(result).toBe(expectedResult);
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

        it('includes location from the lookup array', async () => {
            const expectedResult = createCharacter({
                location_id: 2002,
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'location'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new CharacterTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'location',
                },
            });
        });

        it('includes race from the lookup array', async () => {
            const expectedResult = createCharacter({
                race_id: 2002,
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

        it('includes family from the lookup array', async () => {
            const expectedResult = createCharacter({
                family_id: 2002,
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

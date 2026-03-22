import { describe, expect, it, vi } from 'vitest';
import api from '..';
import type {
    KankaApiAbilityLink,
    KankaApiCharacterOrganisationLink,
    KankaApiEntity,
    KankaApiEntityId,
    KankaApiModuleType,
    KankaApiId,
    KankaApiInventory,
    KankaApiOrganisation,
    KankaApiRelation,
} from '../../types/kanka';
import OrganisationTypeLoader from './OrganisationTypeLoader';

vi.mock('../../api/KankaApi');

function createOrganisation(data: Partial<KankaApiOrganisation> = {}): KankaApiOrganisation {
    return {
        members: [],
        parents: [],
        children: [],
        relations: [],
        inventory: [],
        entity_abilities: [],
        reminders: [],
        ...data,
    } as KankaApiOrganisation;
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
            api: 'http://api.kanka.com/campaign/4711/organisations/1234',
        },
    };
}

describe('OrganisationTypeLoader', () => {
    describe('getType()', () => {
        it('returns the correct type', () => {
            const loader = new OrganisationTypeLoader();

            expect(loader.getType()).toEqual('organisation');
        });
    });

    describe('load()', () => {
        it('returns result of getOrganisation', async () => {
            const expectedResult = createOrganisation();
            const loader = new OrganisationTypeLoader();
            vi.mocked(api).getOrganisation.mockResolvedValue(expectedResult);

            const result = await loader.load(4711, 12);

            expect(api.getOrganisation).toHaveBeenCalledWith(4711, 12);
            expect(result).toMatchObject(expectedResult);
        });

        it('normalizes location_id to locations array', async () => {
            const expectedResult = createOrganisation({ location_id: 42 });
            const loader = new OrganisationTypeLoader();
            vi.mocked(api).getOrganisation.mockResolvedValue(expectedResult);

            const result = await loader.load(4711, 12);

            expect(result.locations).toEqual([42]);
        });
    });

    describe('loadAll()', () => {
        it('returns result of getAllOrganisations', async () => {
            const expectedResult = [createOrganisation()];
            const loader = new OrganisationTypeLoader();
            vi.mocked(api).getAllOrganisations.mockResolvedValue(expectedResult);

            const result = await loader.loadAll(4711);

            expect(api.getAllOrganisations).toHaveBeenCalledWith(4711);
            expect(result).toMatchObject(expectedResult);
        });

        it('normalizes location_id to locations array for all organisations', async () => {
            const expectedResult = [createOrganisation({ location_id: 42 }), createOrganisation({ location_id: 99 })];
            const loader = new OrganisationTypeLoader();
            vi.mocked(api).getAllOrganisations.mockResolvedValue(expectedResult);

            const result = await loader.loadAll(4711);

            expect(result[0].locations).toEqual([42]);
            expect(result[1].locations).toEqual([99]);
        });
    });

    describe('createReferenceCollection()', () => {
        it('includes relations from the lookup array', async () => {
            const expectedResult = createOrganisation({
                relations: [{ target_id: 1002 } as KankaApiRelation],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'character'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new OrganisationTypeLoader();
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
            const expectedResult = createOrganisation({
                inventory: [{ item_id: 2002 } as KankaApiInventory],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'item'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new OrganisationTypeLoader();
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
            const expectedResult = createOrganisation({
                entity_abilities: [{ ability_id: 2002 } as KankaApiAbilityLink],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'ability'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new OrganisationTypeLoader();
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
            const expectedResult = createOrganisation({
                parents: [2002],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'organisation'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new OrganisationTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'organisation',
                },
            });
        });

        it('includes children from the lookup array', async () => {
            const expectedResult = createOrganisation({
                children: [2002],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'organisation'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new OrganisationTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'organisation',
                },
            });
        });

        it('includes members from the lookup array', async () => {
            const expectedResult = createOrganisation({
                members: [{ character_id: 2002 } as KankaApiCharacterOrganisationLink],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'character'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new OrganisationTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'character',
                },
            });
        });

        it('includes locations from the lookup array', async () => {
            const expectedResult = createOrganisation({
                locations: [2001, 2004],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'organisation'),
                createEntity(1003, 2003, 'quest'),
                createEntity(1004, 2004, 'location'),
            ];

            const loader = new OrganisationTypeLoader();
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

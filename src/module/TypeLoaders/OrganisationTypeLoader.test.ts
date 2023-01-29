/* eslint-disable @typescript-eslint/naming-convention */
import { vi } from 'vitest';
import {
    KankaApiAbilityLink,
    KankaApiCharacterOrganisationLink,
    KankaApiEntity,
    KankaApiEntityId,
    KankaApiEntityType,
    KankaApiId,
    KankaApiInventory,
    KankaApiOrganisation,
    KankaApiRelation,
} from '../../types/kanka';
import api from '../api';
import OrganisationTypeLoader from './OrganisationTypeLoader';

vi.mock('../../api/KankaApi');

function createOrganisation(data: Partial<KankaApiOrganisation> = {}): KankaApiOrganisation {
    return {
        members: [],
        ancestors: [],
        children: [],
        relations: [],
        inventory: [],
        entity_abilities: [],
        ...data,
    } as KankaApiOrganisation;
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
            expect(result).toBe(expectedResult);
        });
    });

    describe('loadAll()', () => {
        it('returns result of getAllOrganisations', async () => {
            const expectedResult = [createOrganisation()];
            const loader = new OrganisationTypeLoader();
            vi.mocked(api).getAllOrganisations.mockResolvedValue(expectedResult);

            const result = await loader.loadAll(4711);

            expect(api.getAllOrganisations).toHaveBeenCalledWith(4711);
            expect(result).toBe(expectedResult);
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

        it('includes parent from the lookup array', async () => {
            const expectedResult = createOrganisation({
                organisation_id: 2002,
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

        it('includes ancestors from the lookup array', async () => {
            const expectedResult = createOrganisation({
                ancestors: [1002],
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
                children: [{ entity_id: 1002 }],
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

        it('includes location from the lookup array', async () => {
            const expectedResult = createOrganisation({
                location_id: 2002,
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'location'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new OrganisationTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'location',
                },
            });
        });
    });
});

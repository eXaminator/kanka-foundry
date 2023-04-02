/* eslint-disable @typescript-eslint/naming-convention */
import { vi } from 'vitest';
import {
    KankaApiAbilityLink,
    KankaApiEntity,
    KankaApiEntityId,
    KankaApiEntityType,
    KankaApiId,
    KankaApiInventory,
    KankaApiNote,
    KankaApiRelation,
} from '../../types/kanka';
import api from '..';
import NoteTypeLoader from './NoteTypeLoader';

vi.mock('../../api/KankaApi');

function createNote(data: Partial<KankaApiNote> = {}): KankaApiNote {
    return {
        relations: [],
        inventory: [],
        entity_abilities: [],
        ancestors: [],
        children: [],
        ...data,
    } as KankaApiNote;
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

describe('NoteTypeLoader', () => {
    describe('getType()', () => {
        it('returns the correct type', () => {
            const loader = new NoteTypeLoader();

            expect(loader.getType()).toEqual('note');
        });
    });

    describe('load()', () => {
        it('returns result of getNote', async () => {
            const expectedResult = createNote();
            const loader = new NoteTypeLoader();
            vi.mocked(api).getNote.mockResolvedValue(expectedResult);

            const result = await loader.load(4711, 12);

            expect(api.getNote).toHaveBeenCalledWith(4711, 12);
            expect(result).toBe(expectedResult);
        });
    });

    describe('loadAll()', () => {
        it('returns result of getAllNotes', async () => {
            const expectedResult = [createNote()];
            const loader = new NoteTypeLoader();
            vi.mocked(api).getAllNotes.mockResolvedValue(expectedResult);

            const result = await loader.loadAll(4711);

            expect(api.getAllNotes).toHaveBeenCalledWith(4711);
            expect(result).toBe(expectedResult);
        });
    });

    describe('createReferenceCollection()', () => {
        it('includes relations from the lookup array', async () => {
            const expectedResult = createNote({
                relations: [{ target_id: 1002 } as KankaApiRelation],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'character'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new NoteTypeLoader();
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
            const expectedResult = createNote({
                inventory: [{ item_id: 2002 } as KankaApiInventory],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'item'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new NoteTypeLoader();
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
            const expectedResult = createNote({
                entity_abilities: [{ ability_id: 2002 } as KankaApiAbilityLink],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'ability'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new NoteTypeLoader();
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
            const expectedResult = createNote({
                ancestors: [1002],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'note'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new NoteTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'note',
                },
            });
        });

        it('includes children from the lookup array', async () => {
            const expectedResult = createNote({
                children: [{ entity_id: 1002 }],
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'note'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new NoteTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'note',
                },
            });
        });

        it('includes parent from the lookup array', async () => {
            const expectedResult = createNote({
                note_id: 2002,
            });

            const entities = [
                createEntity(1001, 2001, 'location'),
                createEntity(1002, 2002, 'note'),
                createEntity(1003, 2003, 'quest'),
            ];

            const loader = new NoteTypeLoader();
            const collection = await loader.createReferenceCollection(4711, expectedResult, entities);

            expect(collection.getRecord()).toMatchObject({
                1002: {
                    id: 2002,
                    entityId: 1002,
                    type: 'note',
                },
            });
        });
    });
});

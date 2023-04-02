import api from '..';
import { KankaApiEntity, KankaApiEntityType, KankaApiId, KankaApiNote } from '../../types/kanka';
import type ReferenceCollection from '../ReferenceCollection';
import AbstractTypeLoader from './AbstractTypeLoader';

export default class NoteTypeLoader extends AbstractTypeLoader<KankaApiNote> {
    public getType(): KankaApiEntityType {
        return 'note';
    }

    public async createReferenceCollection(
        campaignId: KankaApiId,
        entity: KankaApiNote,
        lookup: KankaApiEntity[] = [],
    ): Promise<ReferenceCollection> {
        const collection = await super.createReferenceCollection(campaignId, entity, lookup);

        await Promise.all([
            collection.addById(entity.note_id, 'note'),
            ...entity.ancestors.map(ancestor => collection.addByEntityId(ancestor)),
            ...entity.children.map(child => collection.addByEntityId(child.entity_id)),
        ]);

        return collection;
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiNote> {
        return api.getNote(campaignId, id);
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiNote[]> {
        return api.getAllNotes(campaignId);
    }
}

import api from '..';
import type { KankaApiEntity, KankaApiModuleType, KankaApiId, KankaApiNote } from '../../types/kanka';
import type ReferenceCollection from '../ReferenceCollection';
import AbstractTypeLoader from './AbstractTypeLoader';

export default class NoteTypeLoader extends AbstractTypeLoader<KankaApiNote> {
    public getType(): KankaApiModuleType {
        return 'note';
    }

    public async createReferenceCollection(
        campaignId: KankaApiId,
        entity: KankaApiNote,
        lookup: KankaApiEntity[] = [],
    ): Promise<ReferenceCollection> {
        const collection = await super.createReferenceCollection(campaignId, entity, lookup);

        await Promise.all([collection.addById(entity.note_id, 'note')]);

        return collection;
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiNote> {
        return api.getNote(campaignId, id);
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiNote[]> {
        return api.getAllNotes(campaignId);
    }
}

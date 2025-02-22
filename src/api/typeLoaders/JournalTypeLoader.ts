import api from '..';
import type { KankaApiEntity, KankaApiModuleType, KankaApiId, KankaApiJournal } from '../../types/kanka';
import type ReferenceCollection from '../ReferenceCollection';
import AbstractTypeLoader from './AbstractTypeLoader';

export default class JournalTypeLoader extends AbstractTypeLoader<KankaApiJournal> {
    public getType(): KankaApiModuleType {
        return 'journal';
    }

    public async createReferenceCollection(
        campaignId: KankaApiId,
        entity: KankaApiJournal,
        lookup: KankaApiEntity[] = [],
    ): Promise<ReferenceCollection> {
        const collection = await super.createReferenceCollection(campaignId, entity, lookup);

        await Promise.all([
            collection.addById(entity.journal_id, 'journal'),
            collection.addById(entity.location_id, 'location'),
            collection.addById(entity.character_id, 'character'),
        ]);

        return collection;
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiJournal> {
        return api.getJournal(campaignId, id);
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiJournal[]> {
        return api.getAllJournals(campaignId);
    }
}

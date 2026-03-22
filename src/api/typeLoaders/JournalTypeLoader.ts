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
            collection.addById(entity.location_id, 'location'),
            collection.addById(entity.author_id, 'character'),
        ]);

        return collection;
    }

    private normalize(entity: KankaApiJournal): KankaApiJournal {
        return {
            ...entity,
            author_id: entity.author_id ?? entity.character_id ?? null,
        };
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiJournal> {
        return this.normalize(await api.getJournal(campaignId, id));
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiJournal[]> {
        return (await api.getAllJournals(campaignId)).map((e) => this.normalize(e));
    }
}

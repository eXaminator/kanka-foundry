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
            ...(entity.locations ?? []).map((id) => collection.addById(id, 'location')),
            collection.addByEntityId(entity.author_id),
            collection.addById(entity.character_id, 'character'),
        ]);

        return collection;
    }

    private normalize(entity: KankaApiJournal): KankaApiJournal {
        return {
            ...entity,
            locations: entity.locations ?? (entity.location_id ? [entity.location_id] : []),
        };
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiJournal> {
        return this.normalize(await api.getJournal(campaignId, id));
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiJournal[]> {
        return (await api.getAllJournals(campaignId)).map((e) => this.normalize(e));
    }
}

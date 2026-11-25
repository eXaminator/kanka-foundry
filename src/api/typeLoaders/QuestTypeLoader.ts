import api from '..';
import type { KankaApiEntity, KankaApiModuleType, KankaApiId, KankaApiQuest } from '../../types/kanka';
import type ReferenceCollection from '../ReferenceCollection';
import AbstractTypeLoader from './AbstractTypeLoader';

export default class QuestTypeLoader extends AbstractTypeLoader<KankaApiQuest> {
    public getType(): KankaApiModuleType {
        return 'quest';
    }

    public async createReferenceCollection(
        campaignId: KankaApiId,
        entity: KankaApiQuest,
        lookup: KankaApiEntity[] = [],
    ): Promise<ReferenceCollection> {
        const collection = await super.createReferenceCollection(campaignId, entity, lookup);

        await Promise.all([
            collection.addByEntityId(entity.instigator_id),
            ...(entity.locations ?? []).map((id) => collection.addById(id, 'location')),
            ...entity.elements.map((element) => collection.addByEntityId(element.entity_id)),
        ]);

        return collection;
    }

    private normalize(entity: KankaApiQuest): KankaApiQuest {
        return {
            ...entity,
            locations: entity.locations ?? (entity.location_id ? [entity.location_id] : []),
        };
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiQuest> {
        return this.normalize(await api.getQuest(campaignId, id));
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiQuest[]> {
        return (await api.getAllQuests(campaignId)).map((e) => this.normalize(e));
    }
}

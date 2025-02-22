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
            collection.addById(entity.quest_id, 'quest'),
            collection.addByEntityId(entity.instigator_id),
            collection.addById(entity.location_id, 'location'),
            ...entity.elements.map((element) => collection.addByEntityId(element.entity_id)),
        ]);

        return collection;
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiQuest> {
        return api.getQuest(campaignId, id);
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiQuest[]> {
        return api.getAllQuests(campaignId);
    }
}

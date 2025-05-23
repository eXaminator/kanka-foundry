import api from '..';
import type { KankaApiEntity, KankaApiModuleType, KankaApiId, KankaApiItem } from '../../types/kanka';
import type ReferenceCollection from '../ReferenceCollection';
import AbstractTypeLoader from './AbstractTypeLoader';

export default class ItemTypeLoader extends AbstractTypeLoader<KankaApiItem> {
    public getType(): KankaApiModuleType {
        return 'item';
    }

    public async createReferenceCollection(
        campaignId: KankaApiId,
        entity: KankaApiItem,
        lookup: KankaApiEntity[] = [],
    ): Promise<ReferenceCollection> {
        const collection = await super.createReferenceCollection(campaignId, entity, lookup);

        await Promise.all([
            collection.addById(entity.location_id, 'location'),
            collection.addById(entity.character_id, 'character'),
        ]);

        return collection;
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiItem> {
        return api.getItem(campaignId, id);
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiItem[]> {
        return api.getAllItems(campaignId);
    }
}

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
            collection.addById(entity.creator_id, 'character'),
        ]);

        return collection;
    }

    private normalize(entity: KankaApiItem): KankaApiItem {
        return {
            ...entity,
            creator_id: entity.creator_id ?? entity.character_id ?? null,
        };
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiItem> {
        return this.normalize(await api.getItem(campaignId, id));
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiItem[]> {
        return (await api.getAllItems(campaignId)).map((e) => this.normalize(e));
    }
}

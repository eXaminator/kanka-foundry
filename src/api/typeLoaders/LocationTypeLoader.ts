import api from '..';
import { KankaApiEntity, KankaApiEntityType, KankaApiId, KankaApiLocation } from '../../types/kanka';
import type ReferenceCollection from '../ReferenceCollection';
import AbstractTypeLoader from './AbstractTypeLoader';

export default class LocationTypeLoader extends AbstractTypeLoader<KankaApiLocation> {
    public getType(): KankaApiEntityType {
        return 'location';
    }

    public async createReferenceCollection(
        campaignId: KankaApiId,
        entity: KankaApiLocation,
        lookup: KankaApiEntity[] = [],
    ): Promise<ReferenceCollection> {
        const collection = await super.createReferenceCollection(campaignId, entity, lookup);

        await Promise.all([
            collection.addById(entity.parent_location_id, 'location'),
            ...entity.ancestors.map(ancestor => collection.addByEntityId(ancestor)),
            ...entity.children.map(child => collection.addByEntityId(child.entity_id)),
        ]);

        return collection;
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiLocation> {
        return api.getLocation(campaignId, id);
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiLocation[]> {
        return api.getAllLocations(campaignId);
    }
}

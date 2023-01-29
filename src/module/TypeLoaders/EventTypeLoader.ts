import { KankaApiEntity, KankaApiEntityType, KankaApiEvent, KankaApiId } from '../../types/kanka';
import api from '../api';
import ReferenceCollection from '../ReferenceCollection';
import AbstractTypeLoader from './AbstractTypeLoader';

export default class EventTypeLoader extends AbstractTypeLoader<KankaApiEvent> {
    public getType(): KankaApiEntityType {
        return 'event';
    }

    public async createReferenceCollection(
        campaignId: KankaApiId,
        entity: KankaApiEvent,
        lookup: KankaApiEntity[] = [],
    ): Promise<ReferenceCollection> {
        const collection = await super.createReferenceCollection(campaignId, entity, lookup);

        await Promise.all([
            collection.addById(entity.location_id, 'location'),
            collection.addById(entity.event_id, 'event'),
        ]);

        return collection;
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiEvent> {
        return api.getEvent(campaignId, id);
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiEvent[]> {
        return api.getAllEvents(campaignId);
    }
}

import api from '..';
import type { KankaApiEntity, KankaApiModuleType, KankaApiEvent, KankaApiId } from '../../types/kanka';
import type ReferenceCollection from '../ReferenceCollection';
import AbstractTypeLoader from './AbstractTypeLoader';

export default class EventTypeLoader extends AbstractTypeLoader<KankaApiEvent> {
    public getType(): KankaApiModuleType {
        return 'event';
    }

    public async createReferenceCollection(
        campaignId: KankaApiId,
        entity: KankaApiEvent,
        lookup: KankaApiEntity[] = [],
    ): Promise<ReferenceCollection> {
        const collection = await super.createReferenceCollection(campaignId, entity, lookup);

        await Promise.all([
            ...(entity.locations ?? []).map((id) => collection.addById(id, 'location')),
        ]);

        return collection;
    }

    private normalize(entity: KankaApiEvent): KankaApiEvent {
        return {
            ...entity,
            locations: entity.locations ?? (entity.location_id ? [entity.location_id] : []),
        };
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiEvent> {
        return this.normalize(await api.getEvent(campaignId, id));
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiEvent[]> {
        return (await api.getAllEvents(campaignId)).map((e) => this.normalize(e));
    }
}

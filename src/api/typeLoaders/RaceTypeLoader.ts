import api from '..';
import { KankaApiEntity, KankaApiEntityType, KankaApiId, KankaApiRace } from '../../types/kanka';
import type ReferenceCollection from '../ReferenceCollection';
import AbstractTypeLoader from './AbstractTypeLoader';

export default class RaceTypeLoader extends AbstractTypeLoader<KankaApiRace> {
    public getType(): KankaApiEntityType {
        return 'race';
    }

    public async createReferenceCollection(
        campaignId: KankaApiId,
        entity: KankaApiRace,
        lookup: KankaApiEntity[] = [],
    ): Promise<ReferenceCollection> {
        const collection = await super.createReferenceCollection(campaignId, entity, lookup);

        await Promise.all([
            collection.addById(entity.race_id, 'race'),
            ...entity.locations.map(location => collection.addById(location, 'location')),
            ...entity.ancestors.map(ancestor => collection.addByEntityId(ancestor)),
            ...entity.children.map(child => collection.addByEntityId(child.entity_id)),
        ]);

        return collection;
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiRace> {
        return api.getRace(campaignId, id);
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiRace[]> {
        return api.getAllRaces(campaignId);
    }
}

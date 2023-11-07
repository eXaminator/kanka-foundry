import api from '..';
import { KankaApiCreature, KankaApiEntity, KankaApiEntityType, KankaApiId } from '../../types/kanka';
import type ReferenceCollection from '../ReferenceCollection';
import AbstractTypeLoader from './AbstractTypeLoader';

export default class CreatureTypeLoader extends AbstractTypeLoader<KankaApiCreature> {
    public getType(): KankaApiEntityType {
        return 'creature';
    }

    public async createReferenceCollection(
        campaignId: KankaApiId,
        entity: KankaApiCreature,
        lookup: KankaApiEntity[] = [],
    ): Promise<ReferenceCollection> {
        const collection = await super.createReferenceCollection(campaignId, entity, lookup);

        await Promise.all([
            collection.addById(entity.creature_id, 'creature'),
            ...entity.locations.map(location => collection.addById(location, 'location')),
            ...entity.ancestors.map(ancestor => collection.addByEntityId(ancestor)),
            ...entity.children.map(child => collection.addByEntityId(child.entity_id)),
        ]);

        return collection;
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiCreature> {
        return api.getCreature(campaignId, id);
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiCreature[]> {
        return api.getAllCreatures(campaignId);
    }
}

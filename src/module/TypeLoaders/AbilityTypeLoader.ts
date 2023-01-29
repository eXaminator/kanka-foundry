import { KankaApiAbility, KankaApiEntity, KankaApiEntityType, KankaApiId } from '../../types/kanka';
import api from '../api';
import ReferenceCollection from '../ReferenceCollection';
import AbstractTypeLoader from './AbstractTypeLoader';

export default class AbilityTypeLoader extends AbstractTypeLoader<KankaApiAbility> {
    public getType(): KankaApiEntityType {
        return 'ability';
    }

    public async createReferenceCollection(
        campaignId: KankaApiId,
        entity: KankaApiAbility,
        lookup: KankaApiEntity[] = [],
    ): Promise<ReferenceCollection> {
        const collection = await super.createReferenceCollection(campaignId, entity, lookup);

        await Promise.all([
            collection.addById(entity.ability_id, 'ability'),
            ...entity.ancestors.map(ancestor => collection.addByEntityId(ancestor)),
            ...entity.children.map(child => collection.addByEntityId(child.entity_id)),
        ]);

        return collection;
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiAbility> {
        return api.getAbility(campaignId, id);
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiAbility[]> {
        return api.getAllAbilities(campaignId);
    }
}

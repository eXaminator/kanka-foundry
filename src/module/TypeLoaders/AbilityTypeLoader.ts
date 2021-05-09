import { KankaApiAbility, KankaApiEntity, KankaApiEntityType, KankaApiId } from '../../types/kanka';
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
            ...entity.abilities.map(ability => collection.addById(ability, 'ability')),
            ...entity.ancestors.map(ancestor => collection.addByEntityId(ancestor)),
        ]);

        return collection;
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiAbility> {
        return this.api.getAbility(campaignId, id);
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiAbility[]> {
        return this.api.getAllAbilities(campaignId);
    }
}

import type KankaApi from '../../api/KankaApi';
import { KankaApiChildEntity, KankaApiEntity, KankaApiEntityType, KankaApiId } from '../../types/kanka';
import ReferenceCollection from '../ReferenceCollection';

export default abstract class AbstractTypeLoader<T extends KankaApiChildEntity = KankaApiChildEntity> {
    constructor(protected api: KankaApi) {}

    public async createReferenceCollection(
        campaignId: KankaApiId,
        entity: T,
        lookup: KankaApiEntity[] = [],
    ): Promise<ReferenceCollection> {
        const collection = new ReferenceCollection(campaignId, lookup, this.api);

        await Promise.all([
            ...entity.relations.map(relation => collection.addByEntityId(relation.target_id)),
            ...entity.inventory.map(item => collection.addById(item.item_id, 'item')),
            ...entity.entity_abilities.map(ability => collection.addById(ability.ability_id, 'ability')),
        ]);

        return collection;
    }

    public abstract getType(): KankaApiEntityType;
    public abstract load(campaignId: KankaApiId, id: KankaApiId): Promise<T>;
    public abstract loadAll(campaignId: KankaApiId): Promise<T[]>;
}

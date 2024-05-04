import { KankaApiChildEntity, KankaApiChildEntityWithChildren, KankaApiEntity, KankaApiEntityType, KankaApiId } from '../../types/kanka';
import ReferenceCollection from '../ReferenceCollection';

export default abstract class AbstractTypeLoader<T extends KankaApiChildEntity = KankaApiChildEntity> {
    public async createReferenceCollection(
        campaignId: KankaApiId,
        entity: T,
        lookup: KankaApiEntity[] = [],
    ): Promise<ReferenceCollection> {
        const collection = new ReferenceCollection(campaignId, lookup);
        const { parents = [], children = [] } = (entity as unknown as KankaApiChildEntityWithChildren);

        await Promise.all([
            ...parents.map(parent => collection.addById(parent, this.getType())),
            ...children.map(child => collection.addById(child, this.getType())),
            ...entity.relations.map(relation => collection.addByEntityId(relation.target_id)),
            ...entity.inventory.map(item => collection.addById(item.item_id, 'item')),
            ...entity.entity_abilities.map(ability => collection.addById(ability.ability_id, 'ability')),
            ...entity.entity_events.map(event => collection.addById(event.calendar_id, 'calendar')),
        ]);

        return collection;
    }

    public abstract getType(): KankaApiEntityType;
    public abstract load(campaignId: KankaApiId, id: KankaApiId): Promise<T>;
    public abstract loadAll(campaignId: KankaApiId): Promise<T[]>;
}

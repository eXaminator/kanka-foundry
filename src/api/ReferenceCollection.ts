import api from '.';
import Reference from '../types/Reference';
import { KankaApiAnyId, KankaApiEntity, KankaApiEntityId, KankaApiEntityType, KankaApiId } from '../types/kanka';

export default class ReferenceCollection {
    #campaignId: KankaApiId;
    #entities: KankaApiEntity[];
    #record: Record<number, Reference> = {};

    constructor(campaignId: KankaApiId, entities: KankaApiEntity[]) {
        this.#campaignId = campaignId;
        this.#entities = [...entities];
    }

    public async addById(id?: KankaApiId | null, type?: KankaApiEntityType | null): Promise<void> {
        if (!id || !type) return;

        const entity = await this.findEntity(id, type);
        if (entity) this.addEntity(entity);
    }

    public async addByEntityId(id?: KankaApiEntityId | null): Promise<void> {
        if (!id) return;

        const entity = await this.findEntity(id);
        if (entity) this.addEntity(entity);
    }

    public findByEntityId(id: KankaApiEntityId): Reference | undefined {
        return this.#record[Number(id)];
    }

    public getRecord(): Record<number, Reference> {
        return { ...this.#record };
    }

    private addEntity(entity: KankaApiEntity): void {
        if (this.#record[entity.id as number]) return;

        this.#record[entity.id as number] = {
            name: entity.name,
            id: entity.child_id,
            entityId: entity.id,
            type: entity.type,
            image: entity.child.has_custom_image ? entity.child.image_full : undefined,
            thumb: entity.child.has_custom_image ? entity.child.image_thumb : undefined,
            isPrivate: entity.is_private,
        };
    }

    private async findEntity(
        id?: KankaApiAnyId | null,
        type?: KankaApiEntityType | null,
    ): Promise<KankaApiEntity | undefined> {
        const entity = this.findEntityInCollection(id, type);

        if (entity) {
            return entity;
        }

        try {
            if (!type) {
                return await api.getEntity(this.#campaignId, id as KankaApiEntityId);
            }

            const list = await api.getAllEntities(this.#campaignId, [type]);
            this.#entities.push(...list);

            return this.findEntityInCollection(id, type);
        } catch (e) {
            return undefined;
        }
    }

    protected findEntityInCollection(
        id?: KankaApiAnyId | null,
        type?: KankaApiEntityType | null,
    ): KankaApiEntity | undefined {
        return this.#entities
            .find(entity => (!type && entity.id === id) || (entity.type === type && entity.child_id === id));
    }
}

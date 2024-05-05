import api from '.';
import type Reference from '../types/Reference';
import type { KankaApiAnyId, KankaApiEntity, KankaApiEntityId, KankaApiEntityType, KankaApiId } from '../types/kanka';

export default class ReferenceCollection {
    #campaignId: KankaApiId;
    #useLookup = false;
    #entities: KankaApiEntity[];
    #record: Record<number, Reference> = {};

    constructor(campaignId: KankaApiId, entities?: KankaApiEntity[]) {
        this.#campaignId = campaignId;
        this.#useLookup = Boolean(entities?.length);
        this.#entities = [...(entities ?? [])];
    }

    static fromRecord(campaignId: number, record: Record<number, Reference>): ReferenceCollection {
        const collection = new ReferenceCollection(campaignId, []);
        collection.#record = record;

        return collection;
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

    public findByIdAndType(id: KankaApiId, type: KankaApiEntityType): Reference | undefined {
        return Object.values(this.#record).find((ref) => ref.id === id && ref.type === type);
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
            urls: entity.urls,
        };
    }

    private async findEntity(
        id?: KankaApiAnyId | null,
        type?: KankaApiEntityType | null,
    ): Promise<KankaApiEntity | undefined> {
        const entity = this.findEntityInCollection(id, type);

        if (entity || this.#useLookup) {
            return entity;
        }

        try {
            if (!type) {
                this.#entities.push(await api.getEntity(this.#campaignId, id as KankaApiEntityId));
                return this.findEntityInCollection(id);
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
        return this.#entities.find(
            (entity) => (!type && entity.id === id) || (entity.type === type && entity.child_id === id),
        );
    }
}

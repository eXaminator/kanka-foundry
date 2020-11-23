import { KankaEntityBaseData } from '../../types/kanka';
import Entity from '../Entity';
import EntityCollection from '../EntityCollection';
import EntityConstructor from '../EntityConstructor';
import KankaApi from '../KankaApi';

export default abstract class EntityBase<
    T extends KankaEntityBaseData = KankaEntityBaseData,
    P extends Entity | undefined = Entity | undefined
> implements Entity {
    constructor(public api: KankaApi<T>, public data: T, public parent: P) {}

    public get id(): number {
        return this.data.id;
    }

    public get isPrivate(): boolean {
        return this.data.is_private;
    }

    protected async findReference<T extends EntityBase>(
        collection: EntityCollection<T>,
        id?: number,
    ): Promise<T | undefined> {
        if (!id) return undefined;
        return collection.byId(id);
    }

    protected createCollection<T extends EntityBase>(path: string, model: EntityConstructor<T>): EntityCollection<T> {
        return new EntityCollection(this.api.withPath(path), model, this);
    }
}

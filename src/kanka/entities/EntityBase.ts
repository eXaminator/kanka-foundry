import { KankaEntityBaseData } from '../../types/kanka';
import Entity from '../Entity';
import EntityCollection from '../EntityCollection';
import EntityConstructor from '../EntityConstructor';
import KankaEndpoint from '../KankaEndpoint';

export default abstract class EntityBase<
    T extends KankaEntityBaseData = KankaEntityBaseData,
    P extends Entity | undefined = Entity | undefined
> implements Entity {
    constructor(public endpoint: KankaEndpoint, public data: T, public parent: P) {}

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
        return new EntityCollection(this.endpoint.withPath(path), model, this);
    }
}

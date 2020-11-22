import type EntityBase from './entities/EntityBase';
import EntityConstructor from './EntityConstructor';

type EntityList = Map<EntityBase['id'], EntityBase>;

export default class EntityCache {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    #cache = new Map<EntityConstructor<any>, EntityList>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public clear(model?: EntityConstructor<any>): void {
        if (model) {
            this.#cache.get(model)?.clear();
        } else {
            this.#cache.clear();
        }
    }

    public hasAny<T extends EntityBase>(model: EntityConstructor<T>): boolean {
        return this.#cache.has(model);
    }

    public getAll<T extends EntityBase>(model: EntityConstructor<T>): T[] {
        const map = this.#cache.get(model);

        if (!map) return [];

        return Array.from(map.values()) as T[];
    }

    public has<T extends EntityBase>(model: EntityConstructor<T>, id: number): boolean {
        return Boolean(this.#cache.get(model)?.has(id));
    }

    public find<T extends EntityBase>(model: EntityConstructor<T>, id: number): T | undefined {
        return this.#cache.get(model)?.get(id) as T;
    }

    public save<T extends EntityBase>(...entities: T[]): void {
        entities.forEach((entity) => {
            const model = entity.constructor as EntityConstructor<T>;

            if (!this.#cache.has(model)) {
                this.#cache.set(model, new Map());
            }

            this.#cache.get(model)?.set(entity.id, entity);
        });
    }
}

export const cache = new EntityCache();

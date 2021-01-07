import { KankaApiAnyId } from '../types/kanka';
import type KankaNode from './KankaNode';
import KankaNodeClass from './KankaNodeClass';

type NodeList = Map<KankaNode['id'], KankaNode>;

export default class KankaNodeCache {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    #cache = new Map<KankaNodeClass, NodeList>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public clear(model?: KankaNodeClass): void {
        if (model) {
            this.#cache.get(model)?.clear();
        } else {
            this.#cache.clear();
        }
    }

    public hasAny<T extends KankaNode>(model: KankaNodeClass<T>): boolean {
        return this.#cache.has(model);
    }

    public getAll<T extends KankaNode>(model: KankaNodeClass<T>): T[] {
        const map = this.#cache.get(model);

        if (!map) return [];

        return Array.from(map.values()) as T[];
    }

    public has<T extends KankaNode>(model: KankaNodeClass<T>, id: KankaApiAnyId): boolean {
        return Boolean(this.#cache.get(model)?.has(id));
    }

    public find<T extends KankaNode>(model: KankaNodeClass<T>, id: KankaApiAnyId): T | undefined {
        return this.#cache.get(model)?.get(id) as T;
    }

    public save<T extends KankaNode>(...entities: T[]): void {
        entities.forEach((entity) => {
            const model = entity.constructor as KankaNodeClass<T>;

            if (!this.#cache.has(model)) {
                this.#cache.set(model, new Map());
            }

            this.#cache.get(model)?.set(entity.id, entity);
        });
    }
}

export const cache = new KankaNodeCache();

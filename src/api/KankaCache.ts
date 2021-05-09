import EntityType from '../types/EntityType';
import { KankaApiBaseEntity, KankaApiEntityId, KankaApiListResult } from '../types/kanka';

const LS_KEY = 'kanka-cache';

export default class KankaEntityCache {
    #sync: string | undefined;
    #cache: Map<KankaApiEntityId, T>;

    constructor(type: EntityType) {
        this.#type = type;

        const rehydrate = JSON.parse(localStorage.getItem(LS_KEY) ?? '{}');
        this.#cache = new Map(rehydrate.cache);
    }

    public save(data: KankaApiListResult<T>): void {
        this.#cache.set(this.createKey(type, id), entity);
        window.localStorage.setItem(LS_KEY, JSON.stringify(this.#cache.entries()));
    }

    public add(entity: ): void {
        this.#cache.set(this.createKey(type, id), entity);
    }

    public load<T extends KankaApiBaseEntity>(type: EntityType, id: KankaApiEntityId): T | undefined {
        return this.#cache.get(this.createKey(type, id)) as T | undefined;
    }

    private createKey(type: EntityType, id: KankaApiEntityId): string {
        return `##${type}##${String(id)}##`;
    }

    private get localStorageKey(): string {
        return `kanka-cache-${this.#type}`;
    }
}

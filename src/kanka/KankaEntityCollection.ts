import { KankaEntityData } from '../types/kanka';
import KankaApi from './KankaApi';
import KankaEntity from './KankaEntity';

interface EntityConstructor<T extends KankaEntity<D>, D extends KankaEntityData> {
    new(api: KankaApi<D>, data: D): T
}

export default class KankaEntityCollection<T extends KankaEntity<D>, D extends KankaEntityData = KankaEntityData> {
    #entries?: Map<number, T>;

    constructor(
        protected api: KankaApi<D[]>,
        protected Model: EntityConstructor<T, D>,
    ) {}

    public async all(force = false): Promise<T[]> {
        if (!this.#entries || force) {
            this.#entries = new Map();
            let nextApi: KankaApi<D[]> | null = this.api;

            while (nextApi) {
                // eslint-disable-next-line no-await-in-loop
                nextApi = await this.loadPage(nextApi);
            }
        }

        return Array.from(this.#entries.values());
    }

    public async byId(id: number, force = false): Promise<T> {
        const entry = this.#entries?.get(id);

        if (entry && !force) {
            return entry;
        }

        const childApi = this.api.withPath<D>(id);
        const { data } = await childApi.load();
        const model = new this.Model(childApi, data as D);
        this.addEntries(model);
        return model;
    }

    private async loadPage(pageApi: KankaApi<D[]>): Promise<KankaApi<D[]> | null> {
        const { data, links } = await pageApi.load();

        const items = data.map((entry) => {
            const childApi = this.api.withPath<D>(entry.id);
            return new this.Model(childApi, entry);
        });
        this.addEntries(...items);

        if (!links.next) {
            return null;
        }

        return pageApi.withUrl(links.next.replace('http://', 'https://'));
    }

    private addEntries(...entries: T[]): void {
        if (!this.#entries) {
            this.#entries = new Map();
        }

        entries.forEach(e => this.#entries?.set(e.id, e));
    }
}

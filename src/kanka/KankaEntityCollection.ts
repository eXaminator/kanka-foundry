import KankaApi from './KankaApi';
import KankaEntity from './KankaEntity';

type AbstractConstructorHelper<T> = (new (...args: unknown[]) => unknown) & T;
type AbstractConstructorParameters<T> = ConstructorParameters<AbstractConstructorHelper<T>>;

interface EntityConstructor<T extends KankaEntity> {
    new(api: KankaApi, data: AbstractConstructorParameters<T>[1]): T
}

export default class KankaEntityCollection<T extends KankaEntity> {
    #entries?: Map<number, T>;

    constructor(
        protected api: KankaApi,
        protected Model: EntityConstructor<T>,
    ) {}

    public async all(force = false): Promise<T[]> {
        if (!this.#entries || force) {
            this.#entries = new Map();
            let nextApi: KankaApi | null = this.api;

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

        const { data } = await this.api.loadById(id);
        const model = new this.Model(this.api.withPath(String(data.id)), data);
        this.addEntries(model);
        return model;
    }

    private async loadPage(pageApi: KankaApi): Promise<KankaApi | null> {
        const { data, links } = await pageApi.loadList();

        const items = data.map(entry => new this.Model(this.api.withPath(String(entry.id)), entry));
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

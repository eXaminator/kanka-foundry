import type EntityBase from './entities/EntityBase';
import { cache } from './EntityCache';
import EntityConstructor from './EntityConstructor';
import KankaApi from './KankaApi';

interface Page<T extends EntityBase> {
    items: T[];
    api?: KankaApi<T['data'][]>;
}

export default class EntityCollection<T extends EntityBase> {
    #isFullyLoaded = false;

    constructor(
        protected api: KankaApi<T['data'][]>,
        protected Model: EntityConstructor<T>,
        protected parent?: T['parent'],
    ) {}

    public async all(): Promise<T[]> {
        if (this.#isFullyLoaded) {
            return cache.getAll(this.Model);
        }

        let nextApi: KankaApi<T['data'][]> | undefined = this.api;

        while (nextApi) {
            // eslint-disable-next-line no-await-in-loop
            const page = await this.loadPage(nextApi);
            nextApi = page.api;
            cache.save(...page.items);
        }

        this.#isFullyLoaded = true;
        return cache.getAll(this.Model);
    }

    public async byId(id: number): Promise<T> {
        if (!cache.has(this.Model, id)) {
            const childApi = this.api.withPath<T['data']>(id);
            const { data } = await childApi.load();
            cache.save(new this.Model(childApi, data, this.parent));
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return cache.find(this.Model, id)!;
    }

    private async loadPage(pageApi: KankaApi<T['data'][]>): Promise<Page<T>> {
        const { data, links } = await pageApi.load();

        const items = data.map(entry => new this.Model(this.api.withPath<T['data']>(entry.id), entry, this.parent));

        if (!links.next) {
            return { items };
        }

        return { items, api: pageApi.withUrl(links.next) };
    }
}

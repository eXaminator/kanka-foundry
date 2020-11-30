import type EntityBase from './entities/EntityBase';
import { cache } from './EntityCache';
import EntityConstructor from './EntityConstructor';
import KankaEndpoint from './KankaEndpoint';
import api from './api';

interface Page<T extends EntityBase> {
    items: T[];
    endpoint?: KankaEndpoint;
}

export default class EntityCollection<T extends EntityBase> {
    #isFullyLoaded = false;

    constructor(
        protected endpoint: KankaEndpoint,
        protected Model: EntityConstructor<T>,
        protected parent?: T['parent'],
    ) {}

    public async all(): Promise<T[]> {
        if (this.#isFullyLoaded) {
            return cache.getAll(this.Model);
        }

        let nextEndpoint: KankaEndpoint | undefined = this.endpoint;

        while (nextEndpoint) {
            // eslint-disable-next-line no-await-in-loop
            const page = await this.loadPage(nextEndpoint);
            nextEndpoint = page.api;
            cache.save(...page.items);
        }

        this.#isFullyLoaded = true;
        return cache.getAll(this.Model);
    }

    public async byId(id: number): Promise<T> {
        if (!cache.has(this.Model, id)) {
            const childEndpoint = this.endpoint.withPath(id);
            const { data } = await api.load(childEndpoint);
            cache.save(new this.Model(childEndpoint, data, this.parent));
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return cache.find(this.Model, id)!;
    }

    private async loadPage(pageEndpoint: KankaEndpoint): Promise<Page<T>> {
        const { data, links } = await api.load(pageEndpoint);

        const items = data.map(entry => new this.Model(this.endpoint.withPath(entry.id), entry, this.parent));

        if (!links.next) {
            return { items };
        }

        return { items, endpoint: pageEndpoint.withUrl(links.next) };
    }
}

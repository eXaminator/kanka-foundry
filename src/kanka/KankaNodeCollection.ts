import { KankaApiAnyId } from '../types/kanka';
import api from './api';
import KankaEndpoint from './KankaEndpoint';
import KankaNode from './KankaNode';
import { cache } from './KankaNodeCache';
import KankaNodeClass from './KankaNodeClass';

interface Page<T extends KankaNode> {
    items: T[];
    endpoint?: KankaEndpoint;
}

export default class KankaNodeCollection<
    T extends KankaNode,
    ModelClass extends KankaNodeClass<T> = KankaNodeClass<T>
> {
    protected fullyLoadedUrl: string | undefined;

    constructor(
        protected endpoint: KankaEndpoint,
        protected Model: ModelClass,
    ) {}

    public async all(): Promise<T[]> {
        return this.loadAllByEndpoint(this.endpoint);
    }

    public async byId(id: KankaApiAnyId): Promise<T | undefined> {
        if (!cache.has(this.Model, id)) {
            const childEndpoint = this.endpoint.withPath(id);
            const { data } = await api.load(childEndpoint);
            cache.save(this.createModel(data));
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return cache.find<T>(this.Model, id)!;
    }

    protected async loadAllByEndpoint(endpoint: KankaEndpoint): Promise<T[]> {
        const cached = cache.getAll<T>(this.Model);

        if (cached.length > 0 && this.fullyLoadedUrl === endpoint.getUrl()) {
            return cached;
        }

        cache.clear(this.Model); // Clear cache if it does not match current endpoint

        const { page, ...baseQuery } = endpoint.getQuery();
        let nextEndpoint: KankaEndpoint | undefined = endpoint;

        while (nextEndpoint) {
            // eslint-disable-next-line no-await-in-loop
            const page = await this.loadPage(nextEndpoint.withQuery(baseQuery));
            nextEndpoint = page.endpoint;
            cache.save(...page.items);
        }

        this.fullyLoadedUrl = endpoint.getUrl();
        return cache.getAll<T>(this.Model);
    }

    protected async loadPage(pageEndpoint: KankaEndpoint): Promise<Page<T>> {
        const { data, links } = await api.load(pageEndpoint);

        const items = data.map(entry => this.createModel(entry));

        if (!links.next) {
            return { items };
        }

        return { items, endpoint: pageEndpoint.withUrl(links.next) };
    }

    protected createModel(data: { id: KankaApiAnyId }): T {
        return new this.Model(this.endpoint.withPath(data.id), data);
    }
}

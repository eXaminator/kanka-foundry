import { KankaApiAnyId, KankaApiId } from '../types/kanka';
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
    #isFullyLoaded = false;

    constructor(
        protected endpoint: KankaEndpoint,
        protected Model: ModelClass,
    ) {}

    public async all(): Promise<T[]> {
        if (this.#isFullyLoaded) {
            return cache.getAll<T>(this.Model);
        }

        let nextEndpoint: KankaEndpoint | undefined = this.endpoint;

        while (nextEndpoint) {
            // eslint-disable-next-line no-await-in-loop
            const page = await this.loadPage(nextEndpoint);
            nextEndpoint = page.endpoint;
            cache.save(...page.items);
        }

        this.#isFullyLoaded = true;
        return cache.getAll<T>(this.Model);
    }

    public async byId(id: KankaApiId): Promise<T> {
        if (!cache.has(this.Model, id)) {
            const childEndpoint = this.endpoint.withPath(id);
            const { data } = await api.load(childEndpoint);
            cache.save(this.createModel(data));
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return cache.find<T>(this.Model, id)!;
    }

    private async loadPage(pageEndpoint: KankaEndpoint): Promise<Page<T>> {
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

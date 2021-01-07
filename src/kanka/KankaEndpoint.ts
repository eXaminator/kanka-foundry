const ROOT_URL = 'https://kanka.io/api/1.0';

export default class KankaEndpoint {
    #url: URL;
    #parent?: KankaEndpoint;

    constructor(url: string, parent?: KankaEndpoint) {
        this.#url = new URL(url.replace('http://', 'https://'));
        this.#parent = parent;
    }

    static createRoot(): KankaEndpoint {
        return new KankaEndpoint(ROOT_URL);
    }

    public withUrl(url: string): KankaEndpoint {
        return new KankaEndpoint(url, this);
    }

    public withPath(path: unknown): KankaEndpoint {
        const newUrl = new URL(this.#url.toString());
        newUrl.search = '';
        newUrl.pathname = `${newUrl.pathname}/${String(path)}`;

        return new KankaEndpoint(newUrl.toString(), this);
    }

    public withQuery(query: Record<string, string>): KankaEndpoint {
        const newUrl = new URL(this.#url.toString());
        Object.entries(query).forEach(([name, value]) => newUrl.searchParams.set(name, value));

        return new KankaEndpoint(newUrl.toString(), this.#parent);
    }

    public getUrl(query?: Record<string, string>): string {
        if (!query) {
            return this.#url.toString();
        }

        const url = new URL(this.#url.toString());
        Object.entries(query).forEach(([name, value]) => url.searchParams.set(name, value));

        return url.toString();
    }

    public getQuery(): Record<string, string> {
        return Object.fromEntries(this.#url.searchParams.entries());
    }
}

import { KankaApiResult } from '../types/kanka';
import AccessToken from './AccessToken';
import RateLimiter from './RateLimiter';

const freeLimit = 30;

export default class KankaFetcher {
    #base: string;
    #token?: AccessToken;
    #limiter = new RateLimiter(61, freeLimit);

    constructor(base: string) {
        this.#base = this.normalizeUrl(base);
    }

    public get limiter(): RateLimiter {
        return this.#limiter;
    }

    public reset(): void {
        this.#token = undefined;
    }

    public get hasToken(): boolean {
        return Boolean(this.#token);
    }

    public set token(token: AccessToken) {
        this.#token = token;
    }

    public set base(base: string) {
        this.#base = this.normalizeUrl(base);
        this.#limiter.reset();
    }

    public get base(): string {
        return this.#base;
    }

    public async fetch<T extends KankaApiResult<unknown>>(path: string): Promise<T> {
        if (!this.#token) {
            throw new Error('Missing token in KankaFetcher');
        }

        await this.#limiter.slot();

        const url = path.startsWith('http') ? path : `${this.#base}${path}`;

        const response = await fetch(
            url,
            {
                mode: 'cors',
                headers: {
                    Authorization: `Bearer ${this.#token.toString()}`,
                    'Content-type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
                },
            },
        );

        const limit = response.headers.get('X-RateLimit-Limit');
        const limitRemaining = response.headers.get('X-RateLimit-Remaining');

        if (limit) this.#limiter.limit = parseInt(limit, 10);
        if (limitRemaining) this.#limiter.remaining = parseInt(limitRemaining, 10);

        if (!response.ok) {
            throw new Error(`Kanka request error: ${response.statusText} (${response.status})`);
        }

        return response.json();
    }

    // https://kanka.foobar.com
    private normalizeUrl(url: string): string {
        let result = url.trim();

        if (!result.endsWith('/')) {
            result = `${result}/`;
        }

        if (!result.startsWith('https://api.kanka.io/') && !result.endsWith('api/1.0/')) {
            result = `${result}api/1.0/`;
        }

        if (!result.endsWith('1.0/')) {
            result = `${result}1.0/`;
        }

        if (!result.startsWith('http')) {
            result = `https://${result}`;
        }

        return result;
    }
}

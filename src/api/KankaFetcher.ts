import { KankaApiResult } from '../types/kanka';
import AccessToken from './AccessToken';
import RateLimiter from './RateLimiter';

const freeLimit = 30;

export default class KankaFetcher {
    readonly #base: string;
    #token?: AccessToken;
    #limiter = new RateLimiter(61, freeLimit);

    constructor(base: string) {
        this.#base = base;
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

    public async fetch<T extends KankaApiResult<unknown>>(path: string): Promise<T> {
        if (!this.#token) {
            throw new Error('Missing token in KankaFetcher');
        }

        await this.#limiter.slot();

        const url = (path.startsWith('http') ? path : `${this.#base}/${path}`)
            .replace('http://', 'https://');

        const response = await fetch(
            url,
            {
                mode: 'cors',
                headers: {
                    Authorization: `Bearer ${this.#token.toString()}`,
                    'Content-type': 'application/json',
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
}

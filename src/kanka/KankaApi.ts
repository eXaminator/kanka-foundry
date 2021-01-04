/* eslint-disable @typescript-eslint/naming-convention */
import { logInfo } from '../logger';
import { KankaApiListResult, KankaProfile, KankaApiResult } from '../types/kanka';
import RateLimiter from '../util/RateLimiter';
import KankaApiCacheEntry from './KankaApiCacheEntry';
import KankaEndpoint from './KankaEndpoint';

const profileEndpoint = KankaEndpoint.createRoot().withPath('profile');

export default class KankaApi {
    #token?: string;
    #cache?: Map<string, KankaApiCacheEntry>;
    #profile?: KankaProfile;
    #limiter = new RateLimiter(61, 29);
    #isRateLimiterSet = false;

    constructor(token?: string) {
        this.#token = token;
    }

    public get token(): string {
        return this.#token ?? '';
    }

    public set token(token: string) {
        this.#token = token;
        this.#isRateLimiterSet = false;
    }

    public get cache(): Map<string, KankaApiCacheEntry> {
        if (!this.#cache) {
            this.#cache = new Map();
        }

        return this.#cache;
    }

    public async getProfile(): Promise<KankaProfile> {
        if (!this.#profile) {
            const result = await this.load<KankaProfile>(profileEndpoint);
            this.#profile = result.data;
        }

        return this.#profile;
    }

    public async load<
        T,
        R = T extends unknown[] ? KankaApiListResult<T> : KankaApiResult<T>
    >(endpoint: KankaEndpoint): Promise<R> {
        const url = endpoint.getUrl({ related: '1' });

        logInfo('request kanka API', { url, inCache: this.cache.has(url) });

        if (this.cache.has(url)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return this.cache.get(url)!.data as unknown as Promise<R>;
        }

        const cacheEntry = new KankaApiCacheEntry();
        this.cache.set(url, cacheEntry);

        try {
            if (!this.#isRateLimiterSet) {
                this.#isRateLimiterSet = true;
                this.#limiter.limit = 29;
                const profile = await this.getProfile();
                logInfo(
                    'Profile loaded, rate limit will be set based on subscription status.',
                    { subscribed: profile.is_patreon },
                );

                if (profile.is_patreon) {
                    this.#limiter.limit = 89;
                }
            }

            await this.#limiter.slot();

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const response = await fetch(
                url,
                {
                    mode: 'cors',
                    headers: {
                        Authorization: `Bearer ${this.#token}`,
                        'Content-type': 'application/json',
                    },
                },
            );

            if (!response.ok) {
                throw new Error(`Kanka request error: ${response.statusText} (${response.status})`);
            }

            const data = await response.json();
            cacheEntry.resolve(data);
            return data;
        } catch (error) {
            // Delete from cache if response was erroneous
            cacheEntry.reject(error);
            this.cache.delete(url);
            throw error;
        }
    }
}

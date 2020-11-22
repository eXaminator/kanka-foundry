/* eslint-disable @typescript-eslint/naming-convention */
import { logInfo } from '../logger';
import { KankaEntityBaseData, KankaListResult, KankaResult } from '../types/kanka';
import { KankaSettings } from '../types/KankaSettings';
import getSetting from '../module/getSettings';
import createThrottle from '../util/createThrottle';
import KankaApiCacheEntry from './KankaApiCacheEntry';

const throttle = createThrottle(61, 29);

export default class KankaApi<T extends KankaEntityBaseData | KankaEntityBaseData[]> {
    #token?: string;
    #cache?: Map<string, KankaApiCacheEntry<KankaEntityBaseData | KankaEntityBaseData[]>>;

    constructor(
        protected baseUrl: string,
        protected parentApi?: KankaApi<KankaEntityBaseData | KankaEntityBaseData[]>,
        token?: string,
    ) {
        this.#token = token;
    }

    static createRoot<C extends KankaEntityBaseData = KankaEntityBaseData>(token?: string): KankaApi<C> {
        return new KankaApi<C>('https://kanka.io/api/1.0', undefined, token);
    }

    public get token(): string | undefined {
        return this.#token ?? this.parentApi?.token ?? getSetting<string>(KankaSettings.accessToken);
    }

    public withUrl<C extends KankaEntityBaseData | KankaEntityBaseData[]>(url: string): KankaApi<C> {
        return new KankaApi<C>(url, this);
    }

    public withPath<C extends KankaEntityBaseData | KankaEntityBaseData[]>(path: string|number): KankaApi<C> {
        return new KankaApi<C>(`${this.baseUrl}/${String(path)}`, this);
    }

    public setToken(token: string): void {
        this.#token = token;
    }

    public get cache(): Map<string, KankaApiCacheEntry<KankaEntityBaseData | KankaEntityBaseData[]>> {
        if (this.parentApi) {
            return this.parentApi.cache;
        }

        if (!this.#cache) {
            this.#cache = new Map();
        }

        return this.#cache;
    }

    public get isCached(): boolean {
        return this.cache.has(this.baseUrl);
    }

    public async load<
        R extends T extends unknown[] ? KankaListResult<T> : KankaResult<T>
    >(): Promise<R> {
        const parsedUrl = new URL(this.baseUrl.replace('http://', 'https://'));
        parsedUrl.searchParams.set('related', '1');
        const url = parsedUrl.toString();

        logInfo('request kanka API', { url: parsedUrl.toString(), inCache: this.isCached });

        if (this.isCached) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return this.cache.get(url)!.data as Promise<R>;
        }

        const cacheEntry = new KankaApiCacheEntry<KankaEntityBaseData | KankaEntityBaseData[]>();
        this.cache.set(url, cacheEntry);

        try {
            await throttle();

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const response = await fetch(
                url,
                {
                    mode: 'cors',
                    headers: {
                        Authorization: `Bearer ${this.token}`,
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

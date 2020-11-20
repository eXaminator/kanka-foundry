/* eslint-disable @typescript-eslint/naming-convention */
import { logInfo } from '../logger';
import { KankaEntityBaseData, KankaListResult, KankaResult } from '../types/kanka';
import { KankaSettings } from '../types/KankaSettings';
import getSetting from '../module/getSettings';

const THROTTLE_TIMEFRAME = 60;
const THROTTLE_LIMIT = 30;
const requestThrottleSlots: ReturnType<typeof setTimeout>[] = [];
const requestThrottleQueue: (() => void)[] = [];

function throttleRequests(): Promise<void> {
    logInfo('throttleRequests', { slots: requestThrottleSlots.length, queue: requestThrottleQueue.length });

    return new Promise((resolve) => {
        const run = (): void => {
            const timeout = setTimeout(() => {
                logInfo('throttleRequests – free slot');
                requestThrottleSlots.splice(requestThrottleSlots.indexOf(timeout), 1);
                const runNext = requestThrottleQueue.shift();
                if (runNext) runNext();
            }, THROTTLE_TIMEFRAME * 1000);
            requestThrottleSlots.push(timeout);
            resolve();
        };

        if (requestThrottleSlots.length < THROTTLE_LIMIT) {
            run();
        } else {
            logInfo('throttleRequests – add to queue');
            requestThrottleQueue.push(run);
        }
    });
}

export default class KankaApi<T extends KankaEntityBaseData | KankaEntityBaseData[]> {
    #token?: string;

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
        return this.#token ?? this.parentApi?.token;
    }

    public withUrl<C extends KankaEntityBaseData | KankaEntityBaseData[]>(url: string): KankaApi<C> {
        return new KankaApi<C>(url, this);
    }

    public withPath<C extends KankaEntityBaseData | KankaEntityBaseData[]>(path: string|number): KankaApi<C> {
        return new KankaApi<C>(`${this.baseUrl}/${String(path)}`, this);
    }

    public async load(): Promise<T extends unknown[] ? KankaListResult<T> : KankaResult<T>> {
        return this.fetch(this.baseUrl);
    }

    public setToken(token: string): void {
        this.#token = token;
    }

    private async fetch(url: string): Promise<T extends unknown[] ? KankaListResult<T> : KankaResult<T>> {
        await throttleRequests();

        const parsedUrl = new URL(url);
        parsedUrl.searchParams.set('related', '1');

        logInfo('request kanka API', { url: parsedUrl.toString() });
        const response = await fetch(
            parsedUrl.toString(),
            {
                mode: 'cors',
                headers: {
                    Authorization: `Bearer ${this.token ?? getSetting<string>(KankaSettings.accessToken)}`,
                    'Content-type': 'application/json',
                },
            },
        );

        if (!response.ok) {
            throw new Error(`Kanka request error: ${response.statusText} (${response.status})`);
        }

        return response.json();
    }
}

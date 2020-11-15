/* eslint-disable @typescript-eslint/naming-convention */
import { logInfo } from '../logger';
import { KankaEntityData, KankaListResult, KankaResult } from '../types/kanka';
import KankaSettings from '../types/KankaSettings';
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

export default class KankaApi<T extends KankaEntityData = KankaEntityData> {
    constructor(
        protected baseUrl: string,
        protected token?: string,
    ) {}

    static createRoot<C extends KankaEntityData>(token?: string): KankaApi<C> {
        return new KankaApi<C>('https://kanka.io/api/1.0', token);
    }

    public withUrl<C extends KankaEntityData>(url: string): KankaApi<C> {
        return new KankaApi<C>(url, this.token);
    }

    public withPath<C extends KankaEntityData>(path: string): KankaApi<C> {
        return new KankaApi<C>(`${this.baseUrl}/${path}`, this.token);
    }

    public loadById(id: number): Promise<KankaResult<T>> {
        return this.fetch<KankaResult<T>>(`${this.baseUrl}/${id}`);
    }

    public loadList(): Promise<KankaListResult<T>> {
        return this.fetch<KankaListResult<T>>(`${this.baseUrl}`);
    }

    public setToken(token: string): void {
        this.token = token;
    }

    private async fetch<T>(url: string): Promise<T> {
        await throttleRequests();
        const response = await fetch(
            url,
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

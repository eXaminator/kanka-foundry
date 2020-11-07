/* eslint-disable @typescript-eslint/naming-convention */
import { logInfo } from '../logger';
import KankaSettings from '../types/KankaSettings';
import getSetting from './getSettings';

export interface KankaLinks {
    first: string;
    last: string;
    prev: string | null;
    next: string | null
}

export interface KankaMeta {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
}

export interface KankaSync {
    date: string;
    timezone_type: number;
    timezone: string;
}

export interface KankaResult<T> {
    data: T;
    links: KankaLinks;
    meta: KankaMeta;
}

export interface KankaListResult<T> extends KankaResult<T[]> {
    sync: KankaSync;
}

export interface CampaignData {
    id: number;
    name: string;
    entry: string;
    image_full?: string;
    image_thumb?: string;
    locale: string;
}

export interface LocationData {
    id: number;
    type: string;
    name: string;
    entry: string;
    image_full?: string;
    image_thumb?: string;
    has_custom_image: boolean;
    is_private: boolean;
    parent_location_id?: number;
}

const THROTTLE_TIMEFRAME = 60;
const THROTTLE_LIMIT = 30;
const requestThrottleSlots: ReturnType<typeof setTimeout>[] = [];
const requestThrottleQueue: (() => void)[] = [];

function throttleRequests(): Promise<void> {
    logInfo('throttleRequests', { slots: requestThrottleSlots.length, queue: requestThrottleQueue.length });

    return new Promise((resolve) => {
        const run = (): void => {
            const timeout = setTimeout(() => {
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
            requestThrottleQueue.push(run);
        }
    });
}

async function fetchKanka<T>(url: string, token?: string): Promise<T> {
    await throttleRequests();
    const response = await fetch(
        url,
        {
            mode: 'cors',
            headers: {
                Authorization: `Bearer ${token ?? getSetting<string>(KankaSettings.accessToken)}`,
                'Content-type': 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error(`Kanka request error: ${response.statusText} (${response.status})`);
    }

    return response.json();
}

async function fetchPages<T>(path: string, token?: string): Promise<T[]> {
    let url: string | null = `https://kanka.io/api/1.0/${path}`;
    const data: T[] = [];

    do {
        // eslint-disable-next-line no-await-in-loop
        const result = await fetchKanka<KankaListResult<T>>(url, token);
        data.push(...result.data);
        url = result.links?.next?.replace(/^http:\/\//, 'https://');
    } while (url);

    return data;
}

async function fetchData<T>(path: string, token?: string): Promise<T> {
    const result = await fetchKanka<KankaResult<T>>(`https://kanka.io/api/1.0/${path}`, token);
    return result.data;
}

export async function getCampaigns(token?: string): Promise<CampaignData[]> {
    return fetchPages('campaigns', token);
}

export async function getCampaign(campaignId: string, token?: string): Promise<CampaignData> {
    return fetchData(`campaigns/${campaignId}`, token);
}

export async function getLocations(campaignId: string, token?: string): Promise<LocationData[]> {
    return fetchPages(`campaigns/${campaignId}/locations`, token);
}

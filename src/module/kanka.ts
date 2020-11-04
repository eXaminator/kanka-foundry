/* eslint-disable @typescript-eslint/naming-convention */
import KankaSettings from '../types/KankaSettings';
import getSetting from './getSettings';

interface KankaLinks {
    first: string;
    last: string;
    prev: string | null;
    next: string | null
}

interface KankaMeta {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
}

interface KankaResult<T> {
    data: T;
    links: KankaLinks;
    meta: KankaMeta;
}

interface CampaignData {
    id: number;
    name: string;
}

async function fetchKanka<T>(path: string, token?: string): Promise<T> {
    const response = await fetch(
        `https://kanka.io/api/1.0/${path}`,
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

export async function getCampaigns(token?: string): Promise<KankaResult<CampaignData[]>> {
    return fetchKanka('campaigns', token);
}

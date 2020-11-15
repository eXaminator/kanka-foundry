/* eslint-disable @typescript-eslint/naming-convention */

export interface KankaResult<T> {
    data: T;
}

export interface KankaListResult<T> {
    data: T;
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

export interface KankaEntityData {
    id: number;
    entity_id: number;
    name: string;
    entry: string;
    entry_parsed: string;
    image_full?: string;
    image_thumb?: string;
    has_custom_image?: boolean;
    is_private: boolean;
}

export interface CampaignData extends KankaEntityData {
    locale: string;
}

export interface LocationData extends KankaEntityData {
    type: string;
    parent_location_id?: number;
}

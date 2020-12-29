/* eslint-disable @typescript-eslint/naming-convention */

export enum Visibility {
    all = 'all',
    admin = 'admin',
    self = 'self',
    adminSelf = 'admin-self',
}

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

export interface KankaAttribute {
    id: number;
    entity_id: number;
    type: null | 'checkbox' | 'section' | 'text';
    name: string;
    value: string | null;
    is_private: boolean;
    is_star: boolean;
    default_order: number;
}

export interface KankaRelation {
    id: number;
    owner_id: number;
    target_id: number;
    relation?: string;
    attitude?: number;
    colour?: string;
    is_private: boolean;
    is_star: boolean;
}

export interface KankaInventory {
    id: number;
    entity_id: number;
    amount: number;
    is_equipped: boolean;
    is_private: boolean;
    item_id: number;
    name: string;
    description?: string;
    position?: string;
    visibility: Visibility;
}

export interface KankaEntityBaseData {
    id: number;
    is_private: boolean;
}

export interface KankaProfile extends KankaEntityBaseData {
    id: number;
    name: string;
    locale: string;
    is_patreon: boolean;
}

export interface KankaEntityNote {
    id: number;
    entity_id: number;
    entry: string;
    is_private: boolean;
    name: string;
    visibility: Visibility;
}

export interface KankaEntityData extends KankaEntityBaseData {
    entity_id: number;
    name: string;
    entry: string;
    entry_parsed: string;
    image?: string;
    image_full?: string;
    image_thumb?: string;
    has_custom_image?: boolean;
    attributes: KankaAttribute[];
    relations: KankaRelation[];
    inventory: KankaInventory[];
    entity_notes: KankaEntityNote[];
    created_at: string;
    created_by: number;
    updated_at: string;
    updated_by: number;
}

export interface CharacterTrait {
    name: string;
    entry: string;
    section: 'appearance' | 'personality';
    is_private: boolean;
    default_order: number;
}

export interface CharacterOrganisationLink {
    organisation_id: number;
    role?: string;
}

export interface CharacterData extends KankaEntityData {
    type?: string;
    title?: string;
    age?: string;
    sex?: string;
    location_id?: number;
    race_id?: number;
    family_id?: number;
    is_dead: boolean;
    traits: CharacterTrait[];
    organisations: { data: CharacterOrganisationLink[] };
}

export interface CampaignData extends KankaEntityData {
    locale: string;
}

export interface LocationData extends KankaEntityData {
    type?: string;
    parent_location_id?: number;
}

export interface RaceData extends KankaEntityData {
    type?: string;
    race_id?: number;
}

export interface OrganisationData extends KankaEntityData {
    type?: string;
    organisation_id?: number;
    location_id?: number;
}

export interface FamilyData extends KankaEntityData {
    type?: string;
    family_id?: number;
    location_id?: number;
    members: number[];
}

export interface ItemData extends KankaEntityData {
    type?: string;
    price?: string;
    size?: string;
    character_id?: number;
    location_id?: number;
}

export interface EventData extends KankaEntityData {
    type?: string;
    date?: string;
    location_id?: number;
}

export interface NoteData extends KankaEntityData {
    type?: string;
    note_id?: number;
}

export interface JournalData extends KankaEntityData {
    type?: string;
    date?: string;
    journal_id?: number;
    character_id?: number;
    location_id?: number;
}

export interface AbilityData extends KankaEntityData {
    type?: string;
    charges?: string;
    ability_id?: number;
}

export interface QuestReferenceData extends KankaEntityBaseData {
    description?: string;
    role?: string;
}

export interface QuestCharacterData extends QuestReferenceData {
    character_id: number;
}

export interface QuestLocationData extends QuestReferenceData {
    location_id: number;
}

export interface QuestItemData extends QuestReferenceData {
    item_id: number;
}

export interface QuestOrganisationData extends QuestReferenceData {
    organisation_id: number;
}

export interface QuestData extends KankaEntityData {
    type?: string;
    date?: string;
    is_completed: boolean;
    quest_id?: number;
    characters: number;
    locations: number;
}

/* eslint-disable @typescript-eslint/naming-convention */

import EntityType from './EntityType';

export type KankaApiId = number | { __type: 'KankaApiId' };
export type KankaApiEntityId = number | { __type: 'KankaApiEntityId' };
export type KankaApiAnyId = KankaApiId | KankaApiEntityId;

export enum KankaVisibility {
    all = 'all',
    admin = 'admin',
    self = 'self',
    adminSelf = 'admin-self',
}

export interface KankaApiConstrainable {
    is_private: boolean;
}

export interface KankaApiEntityWithImage {
    image?: string;
    image_full?: string;
    image_thumb?: string;
    has_custom_image?: boolean;
}

export interface KankaApiBlamable {
    created_at: string;
    created_by: number;
    updated_at: string;
    updated_by: number;
}

export interface KankaApiEntityBase extends KankaApiConstrainable, KankaApiBlamable {
    attributes: KankaApiAttribute[];
    relations: KankaApiRelation[];
    inventory: KankaApiInventory[];
    entity_notes: KankaApiEntityNote[];
}

export interface KankaApiResult<T> {
    data: T;
}

export interface KankaApiListResult<T> {
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

export interface KankaApiAttribute extends KankaApiConstrainable {
    id: KankaApiId;
    type: null | 'checkbox' | 'section' | 'text';
    name: string;
    value: string | null;
    is_star: boolean;
    default_order: number;
}

export interface KankaApiRelation extends KankaApiConstrainable {
    id: KankaApiId;
    owner_id: KankaApiEntityId;
    target_id: KankaApiEntityId;
    relation?: string;
    attitude?: number;
    colour?: string;
    is_star: boolean;
}

export interface KankaApiInventory {
    id: KankaApiId;
    amount: number;
    is_equipped: boolean;
    item_id: KankaApiId;
    name: string;
    description?: string;
    position?: string;
    visibility: KankaVisibility;
}

export interface KankaProfile {
    id: KankaApiId;
    name: string;
    locale: string;
    is_patreon: boolean;
}

export interface KankaApiEntityNote {
    id: KankaApiId;
    entity_id: KankaApiEntityId;
    entry: string;
    entry_parsed: string;
    is_private: boolean;
    name: string;
    visibility: KankaVisibility;
}

export interface KankaApiCampaign extends KankaApiEntityBase, KankaApiEntityWithImage {
    id: KankaApiId;
    name: string;
    entry: string
    locale: string;
}

export interface KankaApiPrimaryEntity extends KankaApiEntityBase, KankaApiEntityWithImage {
    id: KankaApiId;
    entity_id: KankaApiEntityId;
    name: string;
    entry: string;
    entry_parsed: string;
}

export interface KankaApiCharacterTrait extends KankaApiConstrainable {
    name: string;
    entry: string;
    section: 'appearance' | 'personality';
    default_order: number;
}

export interface KankaApiCharacterOrganisationLink {
    organisation_id: KankaApiId;
    role?: string;
}

export interface KankaApiCharacter extends KankaApiPrimaryEntity {
    type?: string;
    title?: string;
    age?: string;
    sex?: string;
    location_id?: number;
    race_id?: number;
    family_id?: number;
    is_dead: boolean;
    traits: KankaApiCharacterTrait[];
    organisations: { data: KankaApiCharacterOrganisationLink[] };
}

export interface KankaApiLocation extends KankaApiPrimaryEntity {
    type?: string;
    parent_location_id?: KankaApiLocation['id'];
}

export interface KankaApiRace extends KankaApiPrimaryEntity {
    type?: string;
    race_id?: KankaApiRace['id'];
}

export interface KankaApiOrganisation extends KankaApiPrimaryEntity {
    type?: string;
    organisation_id?: KankaApiOrganisation['id'];
    location_id?: KankaApiLocation['id'];
}

export interface KankaApiFamily extends KankaApiPrimaryEntity {
    type?: string;
    family_id?: KankaApiFamily['id'];
    location_id?: KankaApiLocation['id'];
    members: KankaApiCharacter['id'][];
}

export interface KankaApiItem extends KankaApiPrimaryEntity {
    type?: string;
    price?: string;
    size?: string;
    character_id?: KankaApiCharacter['id'];
    location_id?: KankaApiLocation['id'];
}

export interface KankaApiEvent extends KankaApiPrimaryEntity {
    type?: string;
    date?: string;
    location_id?: KankaApiLocation['id'];
}

export interface KankaApiNote extends KankaApiPrimaryEntity {
    type?: string;
    note_id?: KankaApiNote['id'];
}

export interface KankaApiJournal extends KankaApiPrimaryEntity {
    type?: string;
    date?: string;
    journal_id?: KankaApiJournal['id'];
    character_id?: KankaApiCharacter['id'];
    location_id?: KankaApiLocation['id'];
}

export interface KankaApiAbility extends KankaApiPrimaryEntity {
    type?: string;
    charges?: string;
    ability_id?: KankaApiAbility['id'];
}

export interface KankaApiQuestReference extends KankaApiPrimaryEntity {
    id: KankaApiId;
    entity_id: KankaApiEntityId;
    description?: string;
    role?: string;
}

export interface KankaApiQuestCharacterReference extends KankaApiQuestReference {
    character_id: KankaApiCharacter['id'];
}

export interface KankaApiQuestLocationReference extends KankaApiQuestReference {
    location_id: KankaApiLocation['id'];
}

export interface KankaApiQuestItemReference extends KankaApiQuestReference {
    item_id: KankaApiItem['id'];
}

export interface KankaApiQuestOrganisationReference extends KankaApiQuestReference {
    organisation_id: KankaApiOrganisation['id'];
}

export interface KankaApiQuest extends KankaApiPrimaryEntity {
    type?: string;
    date?: string;
    is_completed: boolean;
    quest_id?: KankaApiQuest['id'];
    characters: number;
    locations: number;
}

export interface KankaApiEntity extends KankaApiConstrainable, KankaApiEntityWithImage {
    id: KankaApiEntityId;
    child_id: KankaApiId;
    type: EntityType;
    name: string;
}

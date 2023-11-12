/* eslint-disable @typescript-eslint/naming-convention */

export type KankaApiId = number | { __type: 'KankaApiId' };
export type KankaApiEntityId = number | { __type: 'KankaApiEntityId' };
export type KankaApiAnyId = KankaApiId | KankaApiEntityId;
export type KankaApiEntityType =
    'character'
    | 'creature'
    | 'location'
    | 'family'
    | 'ability'
    | 'organisation'
    | 'item'
    | 'note'
    | 'event'
    | 'calendar'
    | 'timeline'
    | 'race'
    | 'quest'
    | 'map'
    | 'journal'
    | 'tag';

export enum KankaVisibility {
    all = 1,
    admin = 2,
    adminSelf = 3,
    self = 4,
    members = 5,
}

export enum KankaOrganisationPinId {
    Character = 1,
    Organisation = 2,
    Both = 3,
}

export enum KankaOrganisationStatusId {
    Active = 0,
    Inactive = 1,
    Unknown = 2,
}

export interface KankaApiSimpleConstrainable {
    is_private: boolean;
}

export interface KankaApiVisibilityConstrainable {
    visibility_id: KankaVisibility;
}

export type AnyConstrainable = KankaApiVisibilityConstrainable | KankaApiSimpleConstrainable | { isPrivate: boolean };

export interface KankaApiEntityImageData {
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

export interface KankaApiChildEntity extends
    KankaApiRelated,
    KankaApiSimpleConstrainable,
    KankaApiBlamable,
    KankaApiEntityImageData {
    id: KankaApiId;
    entity_id: KankaApiEntityId;
    name: string;
    entry: string;
    entry_parsed: string;
    urls: {
        view: string;
        api: string;
    };
}

export interface KankaApiResult<T> {
    data: T;
}

export interface KankaApiListResult<T> extends KankaApiResult<T[]> {
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
    sync: string;
}

export interface KankaApiAttribute extends KankaApiSimpleConstrainable {
    id: KankaApiId;
    type: null | 'checkbox' | 'section' | 'text' | 'number';
    name: string;
    value: string | null;
    parsed: string | null;
    is_star: boolean;
    default_order: number;
}

export interface KankaApiRelation extends KankaApiVisibilityConstrainable {
    id: KankaApiId;
    owner_id: KankaApiEntityId;
    target_id: KankaApiEntityId;
    relation?: string;
    attitude?: number;
    colour?: string;
    is_star: boolean;
}

export interface KankaApiInventory extends KankaApiVisibilityConstrainable {
    id: KankaApiId;
    amount: number;
    is_equipped: boolean;
    item_id: KankaApiId;
    name: string;
    description?: string;
    position?: string;
}

export interface KankaApiEntityPost extends KankaApiVisibilityConstrainable {
    id: KankaApiId;
    entity_id: KankaApiEntityId;
    entry: string;
    entry_parsed: string;
    is_private: boolean;
    name: string;
    position: number | null,
    settings: { collapsed: '0' | '1' } | null,
}

export interface KankaApiEntityEvent extends KankaApiVisibilityConstrainable, KankaApiBlamable {
    id: KankaApiId;
    entity_id: KankaApiEntityId;
    calendar_id: KankaApiId;
    colour: string | null;
    comment: string;
    date: string;
    day: number;
    month: number;
    year: number;
    length: number;
    is_recurring: boolean;
    recurring_periodicity: string | null;
    recurring_until: number | null;
    type_id: number | null;
}

export interface KankaApiAbilityLink extends KankaApiVisibilityConstrainable {
    id: KankaApiId;
    charges: number | null;
    ability_id: KankaApiId;
    note: string | null;
    position: number,
}

export enum KankaApiAssetType {
    file = 1,
    link = 2,
    alias = 3,
}

interface KankaApiEntityBaseAsset extends
    KankaApiBlamable,
    KankaApiVisibilityConstrainable,
    KankaApiSimpleConstrainable {
    entity_id: KankaApiEntityId;
    id: KankaApiId;
    name: string;
    type_id: KankaApiAssetType;
    metadata: unknown;
}

export interface KankaApiEntityAssetAlias extends KankaApiEntityBaseAsset {
    _alias: true;
    _link: false;
    _file: false;
    type_id: KankaApiAssetType.alias;
    metadata: null;
}

export interface KankaApiEntityAssetFile extends KankaApiEntityBaseAsset {
    _file: true;
    _link: false;
    _alias: false;
    type_id: KankaApiAssetType.file;
    _url: string;
    metadata: {
        path: string;
        size: number;
        type: string;
    };
}

export interface KankaApiEntityAssetLink extends KankaApiEntityBaseAsset {
    _link: true;
    _file: false;
    _alias: false;
    type_id: KankaApiAssetType.link;
    metadata: {
        url: string;
        link: string;
    };
}

export type KankaApiEntityAsset = KankaApiEntityAssetAlias | KankaApiEntityAssetFile | KankaApiEntityAssetLink;

export interface KankaApiEntityFile extends KankaApiBlamable, KankaApiVisibilityConstrainable {
    entity_id: KankaApiEntityId;
    id: KankaApiId;
    name: string;
    path: string;
    size: number;
    type: string;
}

export interface KankaApiCampaign extends KankaApiEntityImageData {
    id: KankaApiId;
    name: string;
    entry: string
    locale: string;
}

export interface KankaApiRelated {
    attributes: KankaApiAttribute[];
    relations: KankaApiRelation[];
    inventory: KankaApiInventory[];
    posts: KankaApiEntityPost[];
    entity_abilities: KankaApiAbilityLink[];
    entity_events: KankaApiEntityEvent[];
    entity_assets: KankaApiEntityAsset[];
}

export interface KankaApiChild {
    entity_id: KankaApiEntityId;
    type?: string;
}

export interface KankaApiChildEntityWithChildren extends KankaApiChildEntity {
    children: KankaApiChild[];
}

export interface KankaApiEntity extends KankaApiSimpleConstrainable, KankaApiBlamable {
    id: KankaApiEntityId;
    name: string;
    type: KankaApiEntityType;
    child_id: KankaApiId;
    campaign_id: KankaApiId;
    child: KankaApiEntityImageData;
    is_template: boolean;
    urls: {
        view: string;
        api: string;
    };
}

export interface KankaApiCharacterTrait {
    id: KankaApiId;
    name: string;
    entry: string;
    section: 'appearance' | 'personality';
    default_order: number;
}

export interface KankaApiCharacterOrganisationLink extends KankaApiSimpleConstrainable {
    id: KankaApiId;
    character_id: KankaApiId;
    organisation_id: KankaApiId;
    role?: string;
    pin_id?: KankaOrganisationPinId | null;
    status_id?: KankaOrganisationStatusId | null;
}

export interface KankaApiCharacter extends KankaApiChildEntity {
    location_id: KankaApiId | null;
    title: string | null;
    age: number | null;
    sex: string | null;
    pronouns: string | null;
    race_id: KankaApiId | null;
    type: string | null;
    family_id: KankaApiId | null;
    is_dead: boolean;
    traits: KankaApiCharacterTrait[];
    is_personality_visible: boolean;
    is_personality_pinned: boolean;
    is_appearance_pinned: boolean;
    organisations: { data: KankaApiCharacterOrganisationLink[] };
}

export interface KankaApiCreature extends KankaApiChildEntityWithChildren {
    ancestors: KankaApiEntityId[];
    creature_id: KankaApiId | null;
    locations: KankaApiId[];
    type: string | null;
}

export interface KankaApiAbility extends KankaApiChildEntityWithChildren {
    ancestors: KankaApiEntityId[];
    ability_id: KankaApiId | null;
    type: string | null;
    charges: string | null;
    abilities: KankaApiId[];
}

export interface KankaApiFamily extends KankaApiChildEntityWithChildren {
    ancestors: KankaApiEntityId[];
    family_id: KankaApiId | null;
    type: string | null;
    members: KankaApiId[];
}

export interface KankaApiItem extends KankaApiChildEntityWithChildren {
    ancestors: KankaApiEntityId[];
    item_id: KankaApiId | null;
    location_id: KankaApiId | null;
    character_id: KankaApiId | null;
    type: string | null;
    price: string | null;
    size: string | null;
}

export interface KankaApiJournal extends KankaApiChildEntityWithChildren {
    ancestors: KankaApiEntityId[];
    journal_id: KankaApiId | null;
    location_id: KankaApiId | null;
    character_id: KankaApiId | null;
    type: string | null;
    date: string | null;
    calendar_id: KankaApiId | null;
    calendar_year: number | null;
    calendar_month: number | null;
    calendar_day: number | null;
}

export interface KankaApiLocation extends KankaApiChildEntityWithChildren {
    ancestors: KankaApiEntityId[];
    /**
     * @deprecated Use location_id instead
     */
    parent_location_id: KankaApiId | null;
    location_id: KankaApiId | null;
    type: string | null;
}

export interface KankaApiNote extends KankaApiChildEntityWithChildren {
    ancestors: KankaApiEntityId[];
    note_id: KankaApiId | null;
    type: string | null;
}

export interface KankaApiOrganisation extends KankaApiChildEntityWithChildren {
    ancestors: KankaApiEntityId[];
    organisation_id: KankaApiId | null;
    location_id: KankaApiId | null;
    type: string | null;
    members: KankaApiCharacterOrganisationLink[];
}

export interface KankaApiQuestElement extends KankaApiVisibilityConstrainable {
    id: KankaApiId;
    entity_id: KankaApiEntityId;
    colour: string | null;
    description: string;
    description_parsed: string | null;
    role: string | null;
}

export interface KankaApiQuest extends KankaApiChildEntityWithChildren {
    ancestors: KankaApiEntityId[];
    quest_id: KankaApiId | null;
    character_id: KankaApiId | null;
    type: string | null;
    date: string | null;
    is_completed: boolean;
    elements_count: number;
    elements: KankaApiQuestElement[];
    calendar_id: KankaApiId | null;
    calendar_year: number | null;
    calendar_month: number | null;
    calendar_day: number | null;
}

export interface KankaApiRace extends KankaApiChildEntityWithChildren {
    ancestors: KankaApiEntityId[];
    locations: KankaApiId[];
    race_id: KankaApiId | null;
    type: string | null;
}

export interface KankaApiEvent extends KankaApiChildEntity {
    type: string | null;
    date: string | null;
    location_id: KankaApiId | null;
    event_id: KankaApiId | null;
}

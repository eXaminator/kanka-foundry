/* eslint-disable @typescript-eslint/naming-convention */

export type KankaApiId = number | { __type: 'KankaApiId' };
export type KankaApiEntityId = number | { __type: 'KankaApiEntityId' };
export type KankaApiAnyId = KankaApiId | KankaApiEntityId;
export type KankaApiEntityType =
    'character'
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
    all = 'all',
    members = 'members',
    admin = 'admin',
    self = 'self',
    adminSelf = 'admin-self',
}

export interface KankaApiSimpleConstrainable {
    is_private: boolean;
}

export interface KankaApiVisibilityConstrainable {
    visibility: KankaVisibility;
}

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
    type: null | 'checkbox' | 'section' | 'text';
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

export interface KankaApiEntityNote extends KankaApiVisibilityConstrainable {
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
    entity_notes: KankaApiEntityNote[];
    entity_abilities: KankaApiAbilityLink[];
    entity_events: KankaApiEntityEvent[];
}

export interface KankaApiEntity extends KankaApiSimpleConstrainable, KankaApiBlamable {
    id: KankaApiEntityId;
    name: string;
    type: KankaApiEntityType;
    child_id: KankaApiId;
    campaign_id: KankaApiId;
    child: KankaApiEntityImageData;
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
    organisations: { data: KankaApiCharacterOrganisationLink[] };
}

export interface KankaApiAbility extends KankaApiChildEntity {
    ancestors: KankaApiEntityId[];
    ability_id: KankaApiId | null;
    type: string | null;
    charges: string | null;
    abilities: KankaApiId[];
}

export interface KankaApiFamily extends KankaApiChildEntity {
    ancestors: KankaApiEntityId[];
    family_id: KankaApiId | null;
    type: string | null;
    members: KankaApiId[];
}

export interface KankaApiItem extends KankaApiChildEntity {
    location_id: KankaApiId | null;
    character_id: KankaApiId | null;
    type: string | null;
    price: string | null;
    size: string | null;
}

export interface KankaApiJournal extends KankaApiChildEntity {
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

export interface KankaApiLocation extends KankaApiChildEntity {
    ancestors: KankaApiEntityId[];
    parent_location_id: KankaApiId | null;
    type: string | null;
}

export interface KankaApiNote extends KankaApiChildEntity {
    ancestors: KankaApiEntityId[];
    note_id: KankaApiId | null;
    type: string | null;
}

export interface KankaApiOrganisation extends KankaApiChildEntity {
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

export interface KankaApiQuest extends KankaApiChildEntity {
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

export interface KankaApiRace extends KankaApiChildEntity {
    race_id: KankaApiId | null;
    type: string | null;
}

/* export interface KankaApiPrimaryEntity extends KankaApiBaseEntity, KankaApiEntityWithImage {
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

 export interface KankaApiCharacterOrganisationLink extends KankaApiConstrainable{
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
 colour?: string;
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
 organisations: number;
 items: number;
 } */

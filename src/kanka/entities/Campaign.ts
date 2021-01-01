import EntityType from '../../types/EntityType';
import { CampaignData } from '../../types/kanka';
import EntityCollection from '../EntityCollection';
import Ability from './Ability';
import Character from './Character';
import Event from './Event';
import Family from './Family';
import Item from './Item';
import Journal from './Journal';
import Location from './Location';
import Note from './Note';
import Organisation from './Organisation';
import PrimaryEntity from './PrimaryEntity';
import Quest from './Quest';
import Race from './Race';

export default class Campaign extends PrimaryEntity<CampaignData> {
    #abilities = this.createCollection('abilities', Ability);
    #characters = this.createCollection('characters', Character);
    #families = this.createCollection('families', Family);
    #items = this.createCollection('items', Item);
    #events = this.createCollection('events', Event);
    #locations = this.createCollection('locations', Location);
    #notes = this.createCollection('notes', Note);
    #organisations = this.createCollection('organisations', Organisation);
    #races = this.createCollection('races', Race);
    #journals = this.createCollection('journals', Journal);
    #quests = this.createCollection('quests', Quest);

    get entityType(): EntityType {
        return EntityType.campaign;
    }

    public abilities(): EntityCollection<Ability> {
        return this.#abilities;
    }

    public characters(): EntityCollection<Character> {
        return this.#characters;
    }

    public items(): EntityCollection<Item> {
        return this.#items;
    }

    public journals(): EntityCollection<Journal> {
        return this.#journals;
    }

    public locations(): EntityCollection<Location> {
        return this.#locations;
    }

    public organisations(): EntityCollection<Organisation> {
        return this.#organisations;
    }

    public races(): EntityCollection<Race> {
        return this.#races;
    }

    public families(): EntityCollection<Family> {
        return this.#families;
    }

    public quests(): EntityCollection<Quest> {
        return this.#quests;
    }

    public notes(): EntityCollection<Note> {
        return this.#notes;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public getByType(type: string): EntityCollection<any> | undefined {
        switch (type) {
            case EntityType.ability:
                return this.#abilities;
            case EntityType.character:
                return this.#characters;
            case EntityType.event:
                return this.#events;
            case EntityType.family:
                return this.#families;
            case EntityType.item:
                return this.#items;
            case EntityType.journal:
                return this.#journals;
            case EntityType.location:
                return this.#locations;
            case EntityType.note:
                return this.#notes;
            case EntityType.organisation:
                return this.#organisations;
            case EntityType.quest:
                return this.#quests;
            case EntityType.race:
                return this.#races;
            default:
                return undefined;
        }
    }

    public get locale(): string {
        return this.data.locale;
    }

    public get image(): string | undefined {
        return this.data.image_full;
    }

    public get entry(): string {
        return this.data.entry;
    }
}

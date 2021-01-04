import EntityType from '../../types/EntityType';
import { KankaApiCampaign, KankaApiId, KankaApiPrimaryEntity } from '../../types/kanka';
import KankaEndpoint from '../KankaEndpoint';
import KankaNode from '../KankaNode';
import KankaNodeClass from '../KankaNodeClass';
import KankaNodeCollection from '../KankaNodeCollection';
import KankaPrimaryNodeCollection from '../KankaPrimaryNodeCollection';
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

export default class Campaign extends KankaNode {
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

    constructor(endpoint: KankaEndpoint, protected data: KankaApiCampaign) {
        super(endpoint);
    }

    get id(): KankaApiId {
        return this.data.id;
    }

    get isPrivate(): boolean {
        return this.data.is_private;
    }

    get entityType(): EntityType {
        return EntityType.campaign;
    }

    get name(): string {
        return this.data.name;
    }

    public abilities(): KankaNodeCollection<Ability> {
        return this.#abilities;
    }

    public characters(): KankaNodeCollection<Character> {
        return this.#characters;
    }

    public items(): KankaNodeCollection<Item> {
        return this.#items;
    }

    public journals(): KankaNodeCollection<Journal> {
        return this.#journals;
    }

    public locations(): KankaNodeCollection<Location> {
        return this.#locations;
    }

    public organisations(): KankaNodeCollection<Organisation> {
        return this.#organisations;
    }

    public races(): KankaNodeCollection<Race> {
        return this.#races;
    }

    public families(): KankaNodeCollection<Family> {
        return this.#families;
    }

    public quests(): KankaNodeCollection<Quest> {
        return this.#quests;
    }

    public notes(): KankaNodeCollection<Note> {
        return this.#notes;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public getByType(type: string): KankaNodeCollection<any> | undefined {
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

    protected createCollection<
        T extends PrimaryEntity<KankaApiPrimaryEntity> = PrimaryEntity<KankaApiPrimaryEntity>,
    >(path: string, model: KankaNodeClass<T>): KankaNodeCollection<T> {
        return new KankaPrimaryNodeCollection<T>(this.endpoint.withPath(path), model, this);
    }
}

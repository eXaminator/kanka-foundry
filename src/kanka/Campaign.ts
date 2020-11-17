import { CampaignData } from '../types/kanka';
import Ability from './Ability';
import Character from './Character';
import Event from './Event';
import Family from './Family';
import Item from './Item';
import Journal from './Journal';
import KankaEntity from './KankaEntity';
import KankaEntityCollection from './KankaEntityCollection';
import Location from './Location';
import Note from './Note';
import Organisation from './Organisation';
import Quest from './Quest';
import Race from './Race';

export default class Campaign extends KankaEntity<CampaignData> {
    #abilities = new KankaEntityCollection(this.api.withPath('abilities'), Ability);
    #characters = new KankaEntityCollection(this.api.withPath('characters'), Character);
    #families = new KankaEntityCollection(this.api.withPath('families'), Family);
    #items = new KankaEntityCollection(this.api.withPath('items'), Item);
    #events = new KankaEntityCollection(this.api.withPath('events'), Event);
    #locations = new KankaEntityCollection(this.api.withPath('locations'), Location);
    #notes = new KankaEntityCollection(this.api.withPath('notes'), Note);
    #organisations = new KankaEntityCollection(this.api.withPath('organisations'), Organisation);
    #races = new KankaEntityCollection(this.api.withPath('races'), Race);
    #journals = new KankaEntityCollection(this.api.withPath('journals'), Journal);
    #quests = new KankaEntityCollection(this.api.withPath('quests'), Quest);

    get entityType(): string {
        return 'campaign';
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public getByType(type: string): KankaEntityCollection<any, any> | undefined {
        switch (type) {
            case 'ability':
                return this.#abilities;
            case 'character':
                return this.#characters;
            case 'event':
                return this.#events;
            case 'family':
                return this.#families;
            case 'item':
                return this.#items;
            case 'journal':
                return this.#journals;
            case 'location':
                return this.#locations;
            case 'note':
                return this.#notes;
            case 'organisation':
                return this.#organisations;
            case 'quest':
                return this.#quests;
            case 'race':
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

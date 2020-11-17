import { CampaignData } from '../types/kanka';
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
import Race from './Race';

export default class Campaign extends KankaEntity<CampaignData> {
    #characters = new KankaEntityCollection(this.api.withPath('characters'), Character);
    #families = new KankaEntityCollection(this.api.withPath('families'), Family);
    #items = new KankaEntityCollection(this.api.withPath('items'), Item);
    #events = new KankaEntityCollection(this.api.withPath('events'), Event);
    #locations = new KankaEntityCollection(this.api.withPath('locations'), Location);
    #notes = new KankaEntityCollection(this.api.withPath('notes'), Note);
    #organisations = new KankaEntityCollection(this.api.withPath('organisations'), Organisation);
    #races = new KankaEntityCollection(this.api.withPath('races'), Race);
    #journals = new KankaEntityCollection(this.api.withPath('journals'), Journal);

    get entityType(): string {
        return 'campaign';
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public getByType(type: string): KankaEntityCollection<any, any> | undefined {
        switch (type) {
            case 'character':
                return this.#characters;
            case 'family':
                return this.#families;
            case 'item':
                return this.#items;
            case 'event':
                return this.#events;
            case 'location':
                return this.#locations;
            case 'note':
                return this.#notes;
            case 'organisation':
                return this.#organisations;
            case 'race':
                return this.#races;
            case 'journal':
                return this.#journals;
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

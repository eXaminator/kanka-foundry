import { CampaignData } from '../types/kanka';
import KankaEntity from './KankaEntity';
import KankaEntityCollection from './KankaEntityCollection';
import Location from './Location';

export default class Campaign extends KankaEntity<CampaignData> {
    #locations = new KankaEntityCollection(this.api.withPath('locations'), Location);

    get entityType(): string {
        return 'campaign';
    }

    public get locations(): KankaEntityCollection<Location> {
        return this.#locations;
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

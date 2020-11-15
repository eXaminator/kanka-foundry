import { CampaignData, LocationData, OrganisationData } from '../types/kanka';
import KankaEntity from './KankaEntity';
import KankaEntityCollection from './KankaEntityCollection';
import Location from './Location';
import Organisation from './Organisation';

export default class Campaign extends KankaEntity<CampaignData> {
    #locations = new KankaEntityCollection(this.api.withPath('locations'), Location);
    #organisations = new KankaEntityCollection(this.api.withPath('organisations'), Organisation);

    get entityType(): string {
        return 'campaign';
    }

    public get locations(): KankaEntityCollection<Location, LocationData> {
        return this.#locations;
    }

    public get organisations(): KankaEntityCollection<Organisation, OrganisationData> {
        return this.#organisations;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public getByType(type: string): KankaEntityCollection<any, any> | undefined {
        switch (type) {
            case 'location':
                return this.#locations;
            case 'organisation':
                return this.#organisations;
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

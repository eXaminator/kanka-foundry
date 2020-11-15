import { CampaignData } from '../types/kanka';
import Campaign from './Campaign';
import KankaApi from './KankaApi';
import KankaEntityCollection from './KankaEntityCollection';

export default class CampaignRepository {
    protected api: KankaApi<CampaignData>;
    protected collection: KankaEntityCollection<Campaign>;

    constructor(api: KankaApi) {
        this.api = api.withPath<CampaignData>('campaigns');
        this.collection = new KankaEntityCollection(this.api, Campaign);
    }

    async loadAll(): Promise<Campaign[]> {
        return this.collection.all();
    }

    async loadById(id: number): Promise<Campaign> {
        return this.collection.byId(id);
    }

    setToken(token: string): void {
        this.api.setToken(token);
    }
}

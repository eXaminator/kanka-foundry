import { CampaignData, KankaEntityBaseData } from '../types/kanka';
import Campaign from './Campaign';
import KankaApi from './KankaApi';
import KankaEntityCollection from './KankaEntityCollection';

export default class CampaignRepository {
    protected api: KankaApi<CampaignData[]>;
    protected collection: KankaEntityCollection<Campaign, CampaignData>;

    constructor(api: KankaApi<KankaEntityBaseData>) {
        this.api = api.withPath<CampaignData[]>('campaigns');
        this.collection = new KankaEntityCollection(this.api, Campaign);
    }

    async loadAll(): Promise<Campaign[]> {
        return this.collection.all();
    }

    async loadById(id: number): Promise<Campaign> {
        return this.collection.byId(id);
    }
}

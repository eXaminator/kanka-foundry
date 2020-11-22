import { CampaignData, KankaEntityBaseData } from '../types/kanka';
import Campaign from './entities/Campaign';
import EntityCollection from './EntityCollection';
import KankaApi from './KankaApi';

export default class CampaignRepository {
    protected api: KankaApi<CampaignData[]>;
    protected collection: EntityCollection<Campaign>;

    constructor(api: KankaApi<KankaEntityBaseData>) {
        this.api = api.withPath<CampaignData[]>('campaigns');
        this.collection = new EntityCollection(this.api, Campaign);
    }

    async loadAll(): Promise<Campaign[]> {
        return this.collection.all();
    }

    async loadById(id: number): Promise<Campaign> {
        return this.collection.byId(id);
    }
}

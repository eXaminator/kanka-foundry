import { KankaApiId } from '../types/kanka';
import Campaign from './entities/Campaign';
import KankaCampaignCollection from './KankaCampaignCollection';
import KankaNodeCollection from './KankaNodeCollection';
import KankaEndpoint from './KankaEndpoint';

export default class CampaignRepository {
    protected collection: KankaNodeCollection<Campaign>;

    constructor() {
        const endpoint = KankaEndpoint.createRoot().withPath('campaigns');
        this.collection = new KankaCampaignCollection(endpoint, Campaign);
    }

    async loadAll(): Promise<Campaign[]> {
        return this.collection.all();
    }

    async loadById(id: KankaApiId): Promise<Campaign | undefined> {
        return this.collection.byId(id);
    }
}

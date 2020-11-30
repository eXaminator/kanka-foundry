import Campaign from './entities/Campaign';
import EntityCollection from './EntityCollection';
import KankaEndpoint from './KankaEndpoint';

export default class CampaignRepository {
    protected collection: EntityCollection<Campaign>;

    constructor() {
        const endpoint = KankaEndpoint.createRoot().withPath('campaigns');
        this.collection = new EntityCollection(endpoint, Campaign);
    }

    async loadAll(): Promise<Campaign[]> {
        return this.collection.all();
    }

    async loadById(id: number): Promise<Campaign> {
        return this.collection.byId(id);
    }
}

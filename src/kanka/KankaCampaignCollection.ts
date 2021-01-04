import { KankaApiCampaign } from '../types/kanka';
import type Campaign from './entities/Campaign';
import KankaNodeCollection from './KankaNodeCollection';

export default class KankaCampaignCollection extends KankaNodeCollection<Campaign, typeof Campaign> {
    protected createModel(data: KankaApiCampaign): Campaign {
        return new this.Model(this.endpoint.withPath(data.id), data);
    }
}

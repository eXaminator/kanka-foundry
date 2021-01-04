import { KankaApiPrimaryEntity } from '../types/kanka';
import type Campaign from './entities/Campaign';
import type PrimaryEntity from './entities/PrimaryEntity';
import type KankaEndpoint from './KankaEndpoint';
import type KankaNodeClass from './KankaNodeClass';
import KankaNodeCollection from './KankaNodeCollection';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class KankaPrimaryNodeCollection<T extends PrimaryEntity<any>> extends KankaNodeCollection<T> {
    constructor(
        endpoint: KankaEndpoint,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Model: KankaNodeClass<T>,
        protected campaign: Campaign,
    ) {
        super(endpoint, Model);
    }

    protected createModel(data: KankaApiPrimaryEntity): T {
        return new this.Model(this.endpoint.withPath(data.id), data, this.campaign);
    }
}

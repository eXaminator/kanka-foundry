import EntityType from '../types/EntityType';
import { KankaApiAnyId, KankaApiPrimaryEntity } from '../types/kanka';
import type Campaign from './entities/Campaign';
import Entity from './entities/Entity';
import type PrimaryEntity from './entities/PrimaryEntity';
import type KankaEndpoint from './KankaEndpoint';
import KankaNodeCollection from './KankaNodeCollection';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class KankaEntityCollection extends KankaNodeCollection<Entity> {
    constructor(
        endpoint: KankaEndpoint,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        protected campaign: Campaign,
    ) {
        super(endpoint, Entity);
    }

    public byId<T extends PrimaryEntity>(id: KankaApiAnyId): Promise<Entity<T>> {
        return super.byId(id) as Promise<Entity<T>>;
    }

    public byTypes(types: EntityType[]): Promise<Entity[]> {
        const endpoint = this.endpoint.withQuery({ types: types.join(',') });

        return this.loadAllByEndpoint(endpoint);
    }

    protected createModel(data: KankaApiPrimaryEntity): Entity {
        return new this.Model(this.endpoint.withPath(data.id), data, this.campaign);
    }
}

import { KankaApiQuestReference } from '../types/kanka';
import type Campaign from './entities/Campaign';
import QuestReference from './entities/QuestReference';
import KankaEndpoint from './KankaEndpoint';
import KankaNodeClass from './KankaNodeClass';
import KankaNodeCollection from './KankaNodeCollection';

export default class KankaQuestReferenceCollection<T extends QuestReference> extends KankaNodeCollection<T> {
    constructor(
        endpoint: KankaEndpoint,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Model: KankaNodeClass<T>,
        protected campaign: Campaign,
    ) {
        super(endpoint, Model as KankaNodeClass<T>);
    }

    protected createModel(data: KankaApiQuestReference): T {
        return new this.Model(this.endpoint.withPath(data.id), data, this.campaign);
    }
}

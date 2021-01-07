import { KankaApiId, KankaApiQuestReference } from '../../types/kanka';
import KankaEndpoint from '../KankaEndpoint';
import KankaNode from '../KankaNode';
import type Campaign from './Campaign';
import PrimaryEntity from './PrimaryEntity';

export default abstract class QuestReference<
    T extends PrimaryEntity = PrimaryEntity,
    D extends KankaApiQuestReference = KankaApiQuestReference
> extends KankaNode {
    constructor(endpoint: KankaEndpoint, protected data: D, protected campaign: Campaign) {
        super(endpoint);
    }

    get id(): KankaApiId {
        return this.data.id;
    }

    get isPrivate(): boolean {
        return this.data.is_private;
    }

    get role(): string | undefined {
        return this.data.role;
    }

    get description(): string | undefined {
        return this.data.description;
    }

    get color(): string | undefined {
        return this.data.colour;
    }

    protected abstract loadReference(): Promise<T>;

    async entity(): Promise<T> {
        return this.loadReference();
    }
}

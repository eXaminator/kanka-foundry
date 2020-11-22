import { QuestReferenceData } from '../../types/kanka';
import EntityBase from './EntityBase';
import PrimaryEntity from './PrimaryEntity';
import type Quest from './Quest';

export default abstract class QuestReference<
    T extends PrimaryEntity = PrimaryEntity,
    D extends QuestReferenceData = QuestReferenceData
> extends EntityBase<D, Quest> {
    get role(): string | undefined {
        return this.data.role;
    }

    get description(): string | undefined {
        return this.data.description;
    }

    protected abstract loadReference(): Promise<T>;

    async entity(): Promise<T> {
        return this.loadReference();
    }
}

import { QuestReferenceData } from '../types/kanka';
import EntityBase from './EntityBase';
import KankaEntity from './KankaEntity';

export default abstract class QuestReference<
    T extends KankaEntity = KankaEntity,
    D extends QuestReferenceData = QuestReferenceData
> extends EntityBase<D> {
    #entity?: T;

    get role(): string | undefined {
        return this.data.role;
    }

    get description(): string | undefined {
        return this.data.description;
    }

    protected abstract loadReference(): Promise<T>;

    async entity(): Promise<T> {
        if (!this.#entity) {
            this.#entity = await this.loadReference();
        }

        return this.#entity;
    }
}

import { KankaEntityBaseData } from '../types/kanka';
import KankaApi from './KankaApi';

export default abstract class EntityBase<T extends KankaEntityBaseData = KankaEntityBaseData> {
    constructor(protected api: KankaApi<T>, protected data: T) {}

    public get id(): number {
        return this.data.id;
    }

    public get isPrivate(): boolean {
        return this.data.is_private;
    }
}

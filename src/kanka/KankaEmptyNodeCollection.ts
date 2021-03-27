import { KankaApiAnyId } from '../types/kanka';
import KankaNode from './KankaNode';
import KankaNodeCollection from './KankaNodeCollection';

export default class KankaEmptyNodeCollection<T extends KankaNode> extends KankaNodeCollection<T> {
    public async all(): Promise<T[]> {
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async byId(id: KankaApiAnyId): Promise<T | undefined> {
        return undefined;
    }
}

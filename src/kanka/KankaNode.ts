import { KankaApiAnyId } from '../types/kanka';
import KankaEndpoint from './KankaEndpoint';

export default abstract class KankaNode {
    public abstract get id(): KankaApiAnyId;
    public abstract get isPrivate(): boolean;

    protected constructor(public readonly endpoint: KankaEndpoint) {}
}

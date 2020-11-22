import { KankaEntityBaseData } from '../types/kanka';
import KankaApi from './KankaApi';

export default interface Entity {
    readonly api: KankaApi<KankaEntityBaseData>;
    readonly id: number;
    readonly isPrivate: boolean;
}

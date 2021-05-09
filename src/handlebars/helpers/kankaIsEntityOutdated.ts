import kanka from '../../kanka';
import { KankaApiEntity } from '../../types/kanka';

export default function kankaIsEntityOutdated(entity: KankaApiEntity): boolean {
    return kanka.journals.hasOutdatedEntryByEntityId(entity);
}

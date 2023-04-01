import { hasOutdatedEntryByEntity } from '../../module/journalEntries';
import { KankaApiEntity } from '../../types/kanka';

export default function kankaIsEntityOutdated(entity: KankaApiEntity): boolean {
    return hasOutdatedEntryByEntity(entity);
}

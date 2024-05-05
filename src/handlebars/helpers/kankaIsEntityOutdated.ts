import { hasOutdatedEntryByEntity } from '../../foundry/journalEntries';
import type { KankaApiEntity } from '../../types/kanka';

export default function kankaIsEntityOutdated(entity: KankaApiEntity): boolean {
    return hasOutdatedEntryByEntity(entity);
}

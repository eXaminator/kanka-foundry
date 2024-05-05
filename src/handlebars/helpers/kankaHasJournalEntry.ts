import { findEntryByEntityId } from '../../foundry/journalEntries';
import type { KankaApiEntityId } from '../../types/kanka';

export default function kankaHasJournalEntry(entityId: KankaApiEntityId): boolean {
    return Boolean(findEntryByEntityId(entityId));
}

import kanka from '../../kanka';
import { KankaApiEntityId } from '../../types/kanka';

export default function kankaHasJournalEntry(entityId: KankaApiEntityId): boolean {
    return Boolean(kanka.journals.findByEntityId(entityId));
}

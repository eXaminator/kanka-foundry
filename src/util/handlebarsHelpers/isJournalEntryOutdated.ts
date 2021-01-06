import PrimaryEntity from '../../kanka/entities/PrimaryEntity';
import { hasOutdatedEntry } from '../../module/journal';

export default function isJournalEntryExisting(entity: PrimaryEntity): boolean {
    return hasOutdatedEntry(entity);
}

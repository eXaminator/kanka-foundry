import PrimaryEntity from '../../kanka/entities/PrimaryEntity';
import { findEntryByEntity } from '../../module/journal';

export default function isJournalEntryExisting(entity: PrimaryEntity): boolean {
    return Boolean(findEntryByEntity(entity));
}

import PrimaryEntity from '../../kanka/entities/PrimaryEntity';
import { findEntryByEntity } from '../../module/journal';

export default function getJournalEntryName(entity: PrimaryEntity): string | undefined {
    return findEntryByEntity(entity)?.name;
}

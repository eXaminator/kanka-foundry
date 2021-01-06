import { findEntriesByType } from '../../module/journal';

export default function hasJournalEntryOfType(type: string): boolean {
    return findEntriesByType(type)?.length > 0;
}

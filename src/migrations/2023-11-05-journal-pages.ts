import ReferenceCollection from '../api/ReferenceCollection';
import getMessage from '../foundry/getMessage';
import { updateJournalEntry } from '../foundry/journalEntries';
import { showInfo } from '../foundry/notifications';

async function migrateEntry(entry: JournalEntry) {
    const snapshot = entry.getFlag('kanka-foundry', 'snapshot');

    if (snapshot.entity_notes) snapshot.posts = snapshot.entity_notes;
    if (snapshot.entity_files) snapshot.entity_assets = snapshot.entity_files;

    const references = ReferenceCollection.fromRecord(
        entry.getFlag('kanka-foundry', 'campaign'),
        entry.getFlag('kanka-foundry', 'references'),
    );

    await Promise.all(snapshot.entity_events?.map((event) => references.addById(event.calendar_id, 'calendar')));

    return updateJournalEntry(entry, entry.getFlag('kanka-foundry', 'snapshot'), references);
}

// Migrate from old journal entry format to new page based format
export default async function migrate(): Promise<void> {
    const entries = game.journal?.filter((e) => e.getFlag('kanka-foundry', 'version')?.startsWith('000001')) ?? [];

    if (entries.length > 0) {
        SceneNavigation.displayProgressBar({ label: getMessage('migration.journalPages.progress'), pct: 0 });
        let i = 0;

        for (const entry of entries) {
            await migrateEntry(entry);
            i += 1;
            SceneNavigation.displayProgressBar({
                label: getMessage('migration.journalPages.progress'),
                pct: Math.round((i / entries.length) * 100),
            });
        }

        showInfo('migration.journalPages.success');
    }
}

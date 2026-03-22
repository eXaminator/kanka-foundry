export default async function migrate(): Promise<void> {
    const journals = Array.from(game.journal?.values() ?? []).filter(e => e.getFlag('kanka-foundry', 'id'));

    for (const entry of journals) {
        try {
            const type = entry.getFlag('kanka-foundry', 'type');
            const pages = Array.from(entry.pages.values())
                .filter(p => p.type === 'kanka-foundry.overview');

            const updates = pages.map((page: any) => {
                const snapshot = page.system?.snapshot;
                if (!snapshot) return null;
                const changes: Record<string, unknown> = {};

                if (type === 'character') {
                    if (!snapshot.races && snapshot.race_id != null)
                        changes.races = [snapshot.race_id];
                    if (!snapshot.families && snapshot.family_id != null)
                        changes.families = [snapshot.family_id];
                    if (!snapshot.locations && snapshot.location_id != null)
                        changes.locations = [snapshot.location_id];
                }

                if (type === 'organisation') {
                    if (!snapshot.locations && snapshot.location_id != null)
                        changes.locations = [snapshot.location_id];
                }

                if (type === 'item') {
                    if (snapshot.creator_id == null && snapshot.character_id != null)
                        changes.creator_id = snapshot.character_id;
                }

                if (type === 'journal') {
                    if (snapshot.author_id == null && snapshot.character_id != null)
                        changes.author_id = snapshot.character_id;
                }

                if (Object.keys(changes).length === 0) return null;

                return {
                    _id: page._id,
                    system: {
                        snapshot: { ...snapshot, ...changes },
                    },
                };
            }).filter(Boolean);

            if (updates.length > 0) {
                await entry.updateEmbeddedDocuments('JournalEntryPage', updates as JournalEntryPage.UpdateData[]);
            }
        } catch (error) {
            console.error(`kanka-foundry | Migration failed for journal entry ${entry.id}:`, error);
        }
    }
}

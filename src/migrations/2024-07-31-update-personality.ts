// Migrate from old journal entry format to new page based format
export default async function migrate(): Promise<void> {
    const journals = Array.from(game.journal?.values() ?? []).filter((e) => e.getFlag('kanka-foundry', 'id'));

    for (const entry of journals) {
        const pages = Array
            .from(entry.pages.values())
            .filter((page) => ['kanka-foundry.character-profile'].includes(page.type));

        await entry.updateEmbeddedDocuments('JournalEntryPage', pages.map((page) => {
            return {
                _id: page._id,
                system: {
                    snapshot: {
                        ...(page.system as any).snapshot,
                        personality: (page.system as any).snapshot.personality.map((personality) => ({ ...personality, entry_parsed: personality.entry_parsed ?? personality.entry })),
                    },
                },
            };
        }));
    }
}

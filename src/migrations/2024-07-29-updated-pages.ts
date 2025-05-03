function isOutdatedPage(page: JournalEntryPage): boolean {
    if (page.type !== 'kanka-foundry.children' && page.type !== 'kanka-foundry.family-members') return false;

    return (page.system as any).snapshot.list?.every(e => typeof e === 'object');
}

// Migrate from old journal entry format to new page based format
export default async function migrate(): Promise<void> {
    const journals = Array.from(game.journal?.values() ?? []).filter(e => e.getFlag('kanka-foundry', 'id'));

    for (const entry of journals) {
        const pages = Array
            .from(entry.pages.values())
            .filter(isOutdatedPage);

        await entry.updateEmbeddedDocuments('JournalEntryPage', pages.map((page: any) => {
            return {
                _id: page._id,
                system: {
                    snapshot: {
                        ...page.system.snapshot,
                        list: page.system.snapshot.list.map(({ id, ref }) => id ?? ref.id),
                    },
                },
            };
        }));
    }
}

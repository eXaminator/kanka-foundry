import getGame from "../foundry/getGame";
import { showInfo } from "../foundry/notifications";

// Migrate from old journal entry format to new page based format
export default async function migrate(): Promise<void> {
    const game = getGame();
    const journals = Array.from(game.journal.values()).filter((e: any) => e.getFlag('kanka-foundry', 'id')) as any[];

    for (const entry of journals) {
        const pages = Array
            .from(entry.pages.values())
            .filter((page: any) => ['kanka-foundry.children', 'kanka-foundry.family-members'].includes(page.type) && page.system.snapshot?.list?.every(e => typeof e === 'object'));

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

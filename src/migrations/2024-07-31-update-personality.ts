import getGame from "../foundry/getGame";
import { showInfo } from "../foundry/notifications";

// Migrate from old journal entry format to new page based format
export default async function migrate(): Promise<void> {
    const game = getGame();
    const journals = Array.from(game.journal.values()).filter((e: any) => e.getFlag('kanka-foundry', 'id')) as any[];

    for (const entry of journals) {
        const pages = Array
            .from(entry.pages.values())
            .filter((page: any) => ['kanka-foundry.character-profile'].includes(page.type));

        await entry.updateEmbeddedDocuments('JournalEntryPage', pages.map((page: any) => {
            return {
                _id: page._id,
                system: {
                    snapshot: {
                        ...page.system.snapshot,
                        personality: page.system.snapshot.personality.map((personality) => ({ ...personality, entry_parsed: personality.entry_parsed ?? personality.entry })),
                    },
                },
            };
        }));
    }
}

import type KankaFoundry from '../KankaFoundry';

export default async function migrateV2(module: KankaFoundry): Promise<void> {
    const g = game as Game;
    const entries = g.journal?.filter(e => !!e.getFlag(module.name, 'id') && !e.getFlag('core', 'sheetClass')) ?? [];

    await Promise.all(entries.map(entry => entry.setFlag('core', 'sheetClass', `${module.name}.KankaJournalApplication`)));
}

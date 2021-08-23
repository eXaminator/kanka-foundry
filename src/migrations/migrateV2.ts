import type KankaFoundry from '../KankaFoundry';

export default async function migrateV2(module: KankaFoundry): Promise<void> {
    const entries = module.game.journal?.filter(e => !!e.getFlag(module.name, 'id') && !e.getFlag('core', 'sheetClass')) ?? [];

    await Promise.all(entries.map(entry => entry.setFlag('core', 'sheetClass', `${module.name}.KankaJournalApplication`)));
}

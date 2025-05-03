import moduleConfig from '../../public/module.json';

export default async function migrate(): Promise<void> {
    const entries = game.journal?.filter((e) => !!e.getFlag('kanka-foundry', 'id') && !e.getFlag('core', 'sheetClass')) ?? [];

    await Promise.all(
        entries.map((entry) => entry.setFlag('core', 'sheetClass', `${moduleConfig.name}.KankaJournalApplication`)),
    );
}

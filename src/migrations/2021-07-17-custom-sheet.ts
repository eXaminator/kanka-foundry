import moduleConfig from '../../public/module.json';
import getGame from '../module/getGame';
import { getEntryFlag } from '../module/journalEntries';

export default async function migrate(): Promise<void> {
    const entries = getGame().journal?.filter(e => !!getEntryFlag(e, 'id') && !e.getFlag('core', 'sheetClass')) ?? [];

    await Promise.all(entries.map(entry => entry.setFlag('core', 'sheetClass', `${moduleConfig.name}.KankaJournalApplication`)));
}

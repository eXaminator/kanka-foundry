import KankaBrowserJournal from '../module/KankaBrowserJournal';

export default async function deleteJournalEntry(): Promise<void> {
    Object
        .values(ui.windows)
        .find(a => a.constructor === KankaBrowserJournal)
        ?.render(false);
}

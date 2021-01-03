import KankaBrowser from '../module/KankaBrowser';

export default async function deleteJournalEntry(): Promise<void> {
    Object
        .values(ui.windows)
        .find(a => a.constructor === KankaBrowser)
        ?.render(false);
}

import KankaBrowserApplication from '../../apps/KankaBrowser/KankaBrowserApplication';

export default async function deleteJournalEntry(): Promise<void> {
    Object
        .values(ui.windows)
        .find(a => a.constructor === KankaBrowserApplication)
        ?.render(false);
}

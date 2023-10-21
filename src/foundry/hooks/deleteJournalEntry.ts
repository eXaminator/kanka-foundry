import KankaBrowserApplication from '../../apps/KankaBrowser/KankaBrowserApplication';

export default async function deleteJournalEntry(): Promise<void> {
    Object
        .values(ui.windows)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .find((a: any): a is KankaBrowserApplication => a.constructor === KankaBrowserApplication)
        ?.render(false);
}

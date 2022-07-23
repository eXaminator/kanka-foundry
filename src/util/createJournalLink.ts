export default function createJournalLink(
    entry: JournalEntry,
    label?: string,
): string {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return TextEditor.enrichHTML(`@JournalEntry[${entry.id}]{${label ?? entry.name}}`, { async: false });
}

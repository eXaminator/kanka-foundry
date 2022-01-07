export default function createJournalLink(
    entry: JournalEntry,
    label?: string,
): string {
    return TextEditor.enrichHTML(`@JournalEntry[${entry.id}]{${label ?? entry.name}}`);
}

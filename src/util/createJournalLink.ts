export default function createJournalLink(entry: JournalEntry, label?: string): string {
    return TextEditor.enrichHTML(`@JournalEntry[${entry.id as string}]{${label ?? (entry.name as string)}}`, {
        async: false,
    }) as string;
}

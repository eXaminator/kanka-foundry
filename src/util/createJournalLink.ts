export default function createJournalLink(
    entry: JournalEntry,
    label?: string,
    classes = 'entity-link',
): string {
    return `
        <a draggable="true" data-entity="JournalEntry" data-id="${entry.id}" class="${classes}">
            <i class="fas fa-book-open"></i> ${label ?? entry.name}
        </a>
    `;
}

import createJournalLink from './createJournalLink';

function createEntry(id: string, name: string): JournalEntry {
    return {
        get name(): string {
            return name;
        },
        get id(): string {
            return id;
        },
    } as JournalEntry;
}

describe('createJournalLink()', () => {
    it('returns a link to the given entry', () => {
        const entry = createEntry('4711', 'foobar');

        const result = createJournalLink(entry);

        expect(result).toMatch(new RegExp('<a.*data-id="4711".*><i class="fas fa-book-open"></i> foobar</a>'));
        expect(result).toMatch(new RegExp('data-entity="JournalEntry"'));
        expect(result).toMatch(new RegExp('draggable="true"'));
        expect(result).toMatch(new RegExp('class="entity-link"'));
    });

    it('returns a link with the given label as text', () => {
        const entry = createEntry('4711', 'foobar');

        const result = createJournalLink(entry, 'my label');

        expect(result).toMatch(new RegExp('<a.*><i class="fas fa-book-open"></i> my label</a>'));
    });

    it('returns a link with the given classes', () => {
        const entry = createEntry('4711', 'foobar');

        const result = createJournalLink(entry, undefined, 'my-class');

        expect(result).toMatch(new RegExp('class="my-class"'));
    });
});

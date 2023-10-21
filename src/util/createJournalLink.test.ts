import { describe, it, expect } from 'vitest';
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

        expect(result).toBe('@JournalEntry[4711]{foobar}');
    });

    it('returns a link with the given label as text', () => {
        const entry = createEntry('4711', 'foobar');

        const result = createJournalLink(entry, 'my label');

        expect(result).toBe('@JournalEntry[4711]{my label}');
    });
});

import { describe, expect, it, vi } from 'vitest';
import loaders from './api/typeLoaders';
import ReferenceCollection from './api/ReferenceCollection';
import { createJournalEntry } from './foundry/journalEntries';
import { createEntities } from './syncEntities';
import type { KankaApiCharacter, KankaApiEntity } from './types/kanka';

vi.mock('./api/KankaApi');
vi.mock('./foundry/journalEntries', () => ({
    createJournalEntry: vi.fn(),
    updateJournalEntry: vi.fn(),
}));

describe('createEntities()', () => {
    it('only creates the requested entities if all entities of a type are loaded at once', async () => {
        const loader = loaders.get('character');
        if (!loader) throw new Error('Missing character loader');

        const characters = [1, 2, 3].map((id) => ({ id, name: `Character ${id}` }) as unknown as KankaApiCharacter);
        vi.spyOn(loader, 'loadAll').mockResolvedValue(characters);
        vi.spyOn(loader, 'createReferenceCollection').mockResolvedValue(new ReferenceCollection(4711));

        const lookup = [{ module: { code: 'character' } }] as unknown as KankaApiEntity[];
        await createEntities(4711, 'character', [1, 3], lookup);

        expect(loader.loadAll).toHaveBeenCalledWith(4711);
        expect(vi.mocked(createJournalEntry).mock.calls.map(([, , entity]) => entity.id)).toEqual([1, 3]);
    });
});

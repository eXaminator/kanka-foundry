/* eslint-disable no-await-in-loop, no-restricted-syntax */
import loaders from './api/typeLoaders';
import { createJournalEntry, updateJournalEntry } from './foundry/journalEntries';
import { KankaApiEntity, KankaApiEntityType, KankaApiId } from './types/kanka';

export async function createEntity(
    campaignId: KankaApiId,
    type: KankaApiEntityType,
    id: KankaApiId,
    entityLookup: KankaApiEntity[] = [],
): Promise<void> {
    const loader = loaders.get(type);
    if (!loader) throw new Error(`Missing loader for type ${String(type)}`);
    const entity = await loader.load(campaignId, id);

    const references = await loader.createReferenceCollection(campaignId, entity, entityLookup);
    await createJournalEntry(campaignId, type, entity, references);
}

export async function createEntities(
    campaignId: KankaApiId,
    type: KankaApiEntityType,
    ids: KankaApiId[],
    entityLookup: KankaApiEntity[] = [],
): Promise<void> {
    await Promise.all(ids.map(id => createEntity(campaignId, type, id, entityLookup)));
}

export async function updateEntity(entry: JournalEntry, entityLookup: KankaApiEntity[] = []): Promise<void> {
    const type = entry.getFlag('kanka-foundry', 'type');
    const campaignId = entry.getFlag('kanka-foundry', 'campaign');
    const snapshot = entry.getFlag('kanka-foundry', 'snapshot');

    if (!type || !campaignId || !snapshot) throw new Error('Missing flags on journal entry');

    const loader = loaders.get(type);
    if (!loader) throw new Error(`Missing loader for type ${String(type)}`);
    const entity = await loader.load(campaignId, snapshot.id);

    const references = await loader.createReferenceCollection(campaignId, entity, entityLookup);
    await updateJournalEntry(entry, entity, references);
}

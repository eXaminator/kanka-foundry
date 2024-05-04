/* eslint-disable no-await-in-loop, no-restricted-syntax */
import loaders from './api/typeLoaders';
import { createJournalEntry, updateJournalEntry } from './foundry/journalEntries';
import { KankaApiChildEntity, KankaApiEntity, KankaApiEntityType, KankaApiId } from './types/kanka';
import AbstractTypeLoader from './api/typeLoaders/AbstractTypeLoader';

async function handleEntity(
    loader: AbstractTypeLoader,
    entity: KankaApiChildEntity,
    campaignId: KankaApiId,
    entityLookup: KankaApiEntity[] = [],
) {
    const references = await loader.createReferenceCollection(campaignId, entity, entityLookup);
    await createJournalEntry(campaignId, loader.getType(), entity, references);
}

export async function createEntity(
    campaignId: KankaApiId,
    type: KankaApiEntityType,
    id: KankaApiId,
    entityLookup: KankaApiEntity[] = [],
): Promise<void> {
    console.log('CREATE ENTITY', campaignId, type, id);
    const loader = loaders.get(type);
    if (!loader) throw new Error(`Missing loader for type ${String(type)}`);
    const entity = await loader.load(campaignId, id);

    await handleEntity(loader, entity, campaignId, entityLookup);
}

export async function createEntities(
    campaignId: KankaApiId,
    type: KankaApiEntityType,
    ids: KankaApiId[],
    entityLookup: KankaApiEntity[] = [],
): Promise<void> {
    const numberOfEntities = entityLookup.filter(entity => entity.type === type).length;
    const expectedNumberRequests = Math.ceil(numberOfEntities / 45);

    // Check whether fetching all entities of the type would be more efficient than fetching them individually
    if (ids.length > expectedNumberRequests) {
        const loader = loaders.get(type);
        if (!loader) throw new Error(`Missing loader for type ${String(type)}`);

        const entities = await loader.loadAll(campaignId);
        entities.filter(entity => ids.includes(entity.id));

        for (const entity of entities) {
            // Make sure to handle them in sequence to avoid duplicate folders being created
            await handleEntity(loader, entity, campaignId, entityLookup);
        }
    } else {
        await Promise.all(ids.map(id => createEntity(campaignId, type, id, entityLookup)));
    }
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

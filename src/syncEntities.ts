/* eslint-disable no-await-in-loop, no-restricted-syntax */
import loadChildEntitiesByEntitiesGroupedByType from './api/loadChildEntitiesByEntitiesGroupedByType';
import loaders from './api/typeLoaders';
import { createOrUpdateJournalEntry } from './foundry/journalEntries';
import { KankaApiEntity, KankaApiId } from './types/kanka';
import { ProgressFn } from './types/progress';
import StatCollection from './util/StatCollection';

export default async function syncEntities(
    campaignId: KankaApiId,
    syncEntities: Pick<KankaApiEntity, 'child_id' | 'type'>[],
    entityLookup: KankaApiEntity[],
    onProgress?: ProgressFn,
): Promise<StatCollection> {
    const childrenByType = await loadChildEntitiesByEntitiesGroupedByType(campaignId, syncEntities, onProgress);
    const stats = new StatCollection();

    for (const [type, children] of childrenByType) {
        const loader = loaders.get(type);
        if (!loader) throw new Error(`Missing loader for type ${String(type)}`);

        for (const child of children) {
            try {
                const references = await loader.createReferenceCollection(campaignId, child, entityLookup);
                await createOrUpdateJournalEntry(campaignId, type, child, references);
                stats.addSuccess(type);
            } catch {
                stats.addError(type);
            }
        }
    }

    return stats;
}

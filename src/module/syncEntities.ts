/* eslint-disable no-await-in-loop, no-restricted-syntax */
import { KankaApiEntity, KankaApiEntityType, KankaApiId } from '../types/kanka';
import { ProgressFn } from '../types/progress';
import { createOrUpdateJournalEntry } from './journalEntries';
import loadChildEntitiesByEntitiesGroupedByType from './loadChildEntities';
import loaders from './loaders';

type Stats = {
    success: number;
    error: number;
    total: number;
};

type StatCollection = {
    [key in KankaApiEntityType]?: Stats;
} & { all: Stats };

export default async function syncEntities(
    campaignId: KankaApiId,
    syncEntities: Pick<KankaApiEntity, 'child_id' | 'type'>[],
    entityLookup: KankaApiEntity[],
    onProgress?: ProgressFn,
): Promise<StatCollection> {
    const childrenByType = await loadChildEntitiesByEntitiesGroupedByType(campaignId, syncEntities, onProgress);
    const stats: StatCollection = {
        all: { success: 0, error: 0, total: syncEntities.length },
    };

    for (const [type, children] of childrenByType) {
        const loader = loaders.get(type);
        if (!loader) throw new Error(`Missing loader for type ${String(type)}`);
        stats[type] = { success: 0, error: 0, total: children.length };

        for (const child of children) {
            try {
                const references = await loader.createReferenceCollection(campaignId, child, entityLookup);
                await createOrUpdateJournalEntry(campaignId, type, child, references);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                stats[type]!.success += 1;
                stats.all.success += 1;
            } catch {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                stats[type]!.error += 1;
                stats.all.error += 1;
            }
        }
    }

    return stats;
}

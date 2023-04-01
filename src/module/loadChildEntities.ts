import { logError } from '../logger';
import { KankaApiChildEntity, KankaApiEntity, KankaApiEntityType, KankaApiId } from '../types/kanka';
import { ProgressFn } from '../types/progress';
import groupBy from '../util/groupBy';
import loaders from './loaders';

type Entity = Pick<KankaApiEntity, 'child_id' | 'type'>;

async function loadChildrenByEntities(campaignId: KankaApiId, entities: Entity[]): Promise<KankaApiChildEntity[]> {
    const { type } = entities[0] ?? {};
    if (!type) return [];

    const loader = loaders.get(entities[0].type);
    if (!loader) {
        throw new Error(`Cannot find TypeLoader for "${String(type)}".`);
    }

    const ids = entities.map(e => e.child_id);

    if (ids.length === 1) {
        return [await loader.load(campaignId, ids[0])];
    }

    return (await loader.loadAll(campaignId)).filter(child => ids.includes(child.id));
}

function createEntityMapper(campaignId: KankaApiId, makeProgress: (amount: number) => void) {
    return async ([type, typeEntities]): Promise<[KankaApiEntityType, KankaApiChildEntity[]]> => {
        try {
            const children = await loadChildrenByEntities(campaignId, typeEntities);
            makeProgress(children.length);
            return [type, children];
        } catch (error) {
            logError(error);
            makeProgress(typeEntities.length); // Pretend all entities were loaded
            return [type, []];
        }
    };
}

export default async function loadChildEntitiesByEntitiesGroupedByType(
    campaignId: KankaApiId,
    entities: Entity[],
    onProgress: ProgressFn | undefined = undefined,
): Promise<Map<KankaApiEntityType, KankaApiChildEntity[]>> {
    const groupedEntities = groupBy(entities, 'type');
    const total = entities.length;
    let progress = 0;

    const promises = Array
        .from(groupedEntities.entries())
        .map(createEntityMapper(campaignId, amount => {
            progress += amount;
            onProgress?.(progress, total);
        }));

    const entries = await Promise.all(promises);

    return new Map(entries);
}

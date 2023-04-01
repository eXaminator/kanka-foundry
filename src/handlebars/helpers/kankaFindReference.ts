/* eslint-disable @typescript-eslint/no-explicit-any */
import { findEntryByEntityId, findEntryByTypeAndChildId, getEntryFlag } from '../../module/journalEntries';
import { KankaApiAnyId, KankaApiEntityId, KankaApiEntityType, KankaApiId } from '../../types/kanka';
import Reference from '../../types/Reference';
import kankaIsAccessible from './kankaIsAccessible';

function createReference(id: KankaApiAnyId, type?: KankaApiEntityType): Reference | undefined {
    const journal = type
        ? findEntryByTypeAndChildId(type, id as KankaApiId)
        : findEntryByEntityId(id as KankaApiEntityId);
    const snapshot = journal ? getEntryFlag(journal, 'snapshot') : undefined;
    const snapshotType = type ?? (journal ? getEntryFlag(journal, 'type') : undefined);

    if (!snapshot || !snapshotType) return undefined;

    return {
        type: snapshotType,
        id: snapshot.id,
        entityId: snapshot.entity_id,
        name: snapshot.name,
        image: snapshot.has_custom_image ? snapshot.image_full : undefined,
        thumb: snapshot.has_custom_image ? snapshot.image_thumb : undefined,
        isPrivate: snapshot.is_private,
    };
}

function getBestReference(
    id: KankaApiAnyId,
    type: KankaApiEntityType | undefined,
    references: Record<number, Reference>,
): Reference | undefined {
    const newReference = createReference(id, type);
    if (newReference) return newReference;

    return Object
        .values(references)
        ?.find(ref => ((ref.type === type && ref.id === id) || (!type && ref.entityId === id)));
}

export default function kankaFindReference(
    id: KankaApiAnyId | undefined,
    typeParam: KankaApiEntityType | Handlebars.HelperOptions | undefined,
    optionsParam: Handlebars.HelperOptions | undefined,
): Reference | undefined {
    if (!id) return undefined;

    let type: KankaApiEntityType | undefined = typeParam as KankaApiEntityType;
    let options = optionsParam as Handlebars.HelperOptions;

    if (typeof typeParam === 'object') {
        options = typeParam;
        type = undefined;
    }

    const ref = getBestReference(id, type, options?.data?.root?.kankaReferences ?? options?.hash?.references ?? {});

    if (ref && kankaIsAccessible(ref, options)) {
        return ref;
    }

    return undefined;
}

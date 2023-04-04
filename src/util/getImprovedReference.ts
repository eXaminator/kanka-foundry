import { findEntryByEntityId, getEntryFlag } from '../foundry/journalEntries';
import Reference from '../types/Reference';
import createReferenceLink from './createReferenceLink';

export default async function getImprovedReference(reference: Reference): Promise<Reference> {
    const journal = findEntryByEntityId(reference.entityId);
    const snapshot = journal ? getEntryFlag(journal, 'snapshot') : undefined;
    const type = journal ? getEntryFlag(journal, 'type') : undefined;

    let { image, thumb } = reference;

    if (snapshot) {
        image = snapshot.has_custom_image ? snapshot.image_full : undefined;
        thumb = snapshot.has_custom_image ? snapshot.image_thumb : undefined;
    }

    return {
        ...reference,
        type: type ?? reference.type,
        id: snapshot?.id ?? reference.id,
        entityId: snapshot?.entity_id ?? reference.entityId,
        name: snapshot?.name ?? reference.name,
        isPrivate: snapshot?.is_private ?? reference.isPrivate,
        urls: snapshot?.urls ?? reference.urls,
        image,
        thumb,
        link: reference.link ?? await createReferenceLink(reference),
    };
}

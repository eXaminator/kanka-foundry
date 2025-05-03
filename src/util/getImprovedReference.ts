import { findEntryByEntityId } from '../foundry/journalEntries';
import type Reference from '../types/Reference';
import createReferenceLink from './createReferenceLink';
import isSecret from './isSecret';

export default async function getImprovedReference(reference: Reference): Promise<Reference> {
    const journal = findEntryByEntityId(reference.entityId);
    const snapshot = journal ? journal.getFlag('kanka-foundry', 'snapshot') : undefined;
    const type = journal ? journal.getFlag('kanka-foundry', 'type') : undefined;

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
        isPrivate: isSecret(snapshot, reference),
        urls: snapshot?.urls ?? reference.urls,
        image,
        thumb,
        link: reference.link ?? (await createReferenceLink(reference)),
    };
}

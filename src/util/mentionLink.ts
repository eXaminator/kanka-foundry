import type PrimaryEntity from '../kanka/entities/PrimaryEntity';
import createKankaLink from './createKankaLink';

export default function mentionLink(label: string, target: PrimaryEntity): string {
    const link = createKankaLink(target.parent.id, target.entityType, target.id);

    return `<a href="${link}" data-id="${target.entityId}" class="kanka-reference-link">${label}</a>`;
}

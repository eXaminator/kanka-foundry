import type PrimaryEntity from '../kanka/entities/PrimaryEntity';
import createKankaLink from './createKankaLink';

export default function mentionLink(label: string, target: PrimaryEntity): string {
    const link = createKankaLink(target.campaign.id, target.entityType, target.id);

    return `<a href="${link}" data-id="${String(target.entityId)}" class="kanka-reference-link">${label}</a>`;
}

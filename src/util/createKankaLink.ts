import { KankaApiEntityId, KankaApiEntityType, KankaApiId } from '../types/kanka';
import createKankaUrl from './createKankaUrl';

export default function createKankaLink(
    label: string,
    campaignId: KankaApiId,
    type?: KankaApiEntityType,
    id?: KankaApiId,
    entityId?: KankaApiEntityId,
    classes?: string,
): string {
    const link = createKankaUrl(campaignId, type, id);

    const attrs = [`href="${link}"`, 'target="_blank"'];
    if (entityId) attrs.push(`data-id="${String(entityId)}"`);
    if (classes) attrs.push(`class="${classes}"`);

    return `<a ${attrs.join(' ')}>${label}</a>`;
}

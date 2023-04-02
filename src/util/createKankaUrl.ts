import api from '../api';
import { KankaApiEntityType, KankaApiId } from '../types/kanka';

export default function createKankaUrl(
    campaignId: KankaApiId,
    type?: KankaApiEntityType,
    id?: KankaApiId,
    locale?: string,
): string {
    const url = new URL(api.baseUrl);
    const parts = [`${url.origin}/${locale || 'en'}/campaign/${String(campaignId)}`];

    if (type) {
        const pluralType = `${type.replace(/y$/, 'ie')}s`;
        parts.push(pluralType);
    }

    if (id) {
        parts.push(String(id));
    }

    return parts.join('/');
}

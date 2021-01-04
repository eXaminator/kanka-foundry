import { KankaApiId } from '../types/kanka';

export default function createKankaLink(
    campaignId: KankaApiId,
    type?: string,
    id?: KankaApiId,
    locale?: string,
): string {
    const parts = [`https://kanka.io/${locale || 'en'}/campaign/${String(campaignId)}`];

    if (type) {
        const pluralType = `${type.replace(/y$/, 'ie')}s`;
        parts.push(pluralType);
    }

    if (id) {
        parts.push(String(id));
    }

    return parts.join('/');
}

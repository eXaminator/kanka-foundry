export default function createKankaLink(campaignId: number, type?: string, id?: number, locale?: string): string {
    const parts = [`https://kanka.io/${locale || 'en'}/campaign/${campaignId}`];

    if (type) {
        const pluralType = `${type.replace(/y$/, 'ie')}s`;
        parts.push(pluralType);
    }

    if (id) {
        parts.push(String(id));
    }

    return parts.join('/');
}

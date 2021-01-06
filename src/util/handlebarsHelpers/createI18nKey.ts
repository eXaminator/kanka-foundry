export default function createI18nKey(...parts: unknown[]): string {
    return parts
        .filter(p => typeof p !== 'object')
        .join('.');
}

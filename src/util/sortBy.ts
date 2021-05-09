export default function sortBy<T extends Record<string, unknown>>(...fields: string[]): (a: T, b: T) => number {
    return (a: T, b: T) => fields
        .map(field => String(getProperty(a, field)).localeCompare(String(getProperty(b, field))))
        .find(result => result !== 0) ?? 0;
}

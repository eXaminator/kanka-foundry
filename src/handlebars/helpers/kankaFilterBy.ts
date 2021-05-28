export default function kankaFilterBy<T extends Record<string, unknown>>(
    data: T[],
    property: string,
    expected: unknown,
): T[] {
    if (typeof property === 'object') return data;

    return data.filter(a => getProperty(a, property) === expected);
}

export default function sortBy<T extends Record<string, unknown>>(...fields: string[]): (a: T, b: T) => number {
    return (a: T, b: T) =>
        fields
            .map((field) => {
                const propA = globalThis.getProperty(a, field);
                const propB = globalThis.getProperty(b, field);

                if (typeof propA === 'number' && typeof propB === 'number') {
                    return propA - propB;
                }

                return String(globalThis.getProperty(a, field)).localeCompare(String(globalThis.getProperty(b, field)));
            })
            .find((result) => result !== 0) ?? 0;
}

export default function sortBy<T extends Record<string, unknown>>(...fields: string[]): (a: T, b: T) => number {
    return (a: T, b: T) =>
        fields
            .map((field) => {
                // TODO: Change to foundry.utils.getProperty() once V11 is no longer supported
                const propA = foundry.utils.getProperty(a, field);
                const propB = foundry.utils.getProperty(b, field);

                if (typeof propA === 'number' && typeof propB === 'number') {
                    return propA - propB;
                }

                return String(foundry.utils.getProperty(a, field)).localeCompare(String(foundry.utils.getProperty(b, field)));
            })
            .find((result) => result !== 0) ?? 0;
}

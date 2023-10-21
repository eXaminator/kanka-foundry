type FilterFn<T> = (arg: T) => boolean;

function getFilterFn<T extends Record<string, unknown>>(property: string, expected: unknown): FilterFn<T> {
    if (typeof expected === 'string') {
        const [, isRegex, value] = expected.match(/(regex:)?(.*)/) ?? [];

        if (isRegex) {
            const regex = new RegExp(value);
            return (a: T) => regex.test(globalThis.getProperty(a, property) as string);
        }
    }

    return (a: T) => globalThis.getProperty(a, property) === expected;
}

export default function kankaFilterBy<T extends Record<string, unknown>>(
    data: T[],
    property: string,
    expected: unknown,
    invert: unknown,
): T[] {
    if (typeof property === 'object') return data;

    const filterFn = getFilterFn(property, expected);
    return data.filter(a => (invert === true ? !filterFn(a) : filterFn(a)));
}

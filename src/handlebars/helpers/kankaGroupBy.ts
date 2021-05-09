export default function kankaGroupBy<T extends Record<string, unknown>>(
    data: T[],
    property: string,
): Record<string, T[]> {
    const result = {};

    data?.forEach((obj) => {
        const key = getProperty(obj, property);
        if (!result[key]) result[key] = [];
        result[key].push(obj);
    });

    return result;
}

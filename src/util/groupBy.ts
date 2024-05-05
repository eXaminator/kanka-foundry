export default function groupBy<Type, Key extends keyof Type = keyof Type>(
    array: Type[],
    key: Key,
): Map<Type[Key], Type[]> {
    const grouped = new Map<Type[Key], Type[]>();
    for (const item of array) {
        if (!grouped.has(item[key])) {
            grouped.set(item[key], []);
        }
        grouped.get(item[key])?.push(item);
    }
    return grouped;
}

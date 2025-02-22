type Primitive = string | number | boolean | null | undefined;

type PathValue<T, P extends string> = P extends `${infer K}.${infer R}`
    ? K extends keyof T
    ? PathValue<T[K], R>
    : never
    : P extends keyof T
    ? T[P]
    : never;

type PathImpl<T, Key extends keyof T> = Key extends string
    ? T[Key] extends Primitive
    ? `${Key}`
    : T[Key] extends object
    ? `${Key}` | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>>}`
    : never
    : never;

type Path<T> = PathImpl<T, keyof T>;

function getNestedValue<T, P extends Path<T>>(obj: T, path: P): PathValue<T, P> {
    return path.split('.').reduce<unknown>((acc, part) => {
        return acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined;
    }, obj) as PathValue<T, P>;
}

export default function groupBy<Type, P extends Path<Type> = Path<Type>>(
    array: Type[],
    key: P,
): Map<PathValue<Type, P>, Type[]> {
    const grouped = new Map<PathValue<Type, P>, Type[]>();

    for (const item of array) {
        const value = getNestedValue(item, key);
        if (!grouped.has(value)) {
            grouped.set(value, []);
        }
        grouped.get(value)?.push(item);
    }

    return grouped;
}

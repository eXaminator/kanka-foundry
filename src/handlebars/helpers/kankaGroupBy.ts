import groupBy from '../../util/groupBy';

export default function kankaGroupBy<T extends Record<string, unknown>>(
    data: T[] | undefined | null,
    property: string,
): Record<string, T[]> {
    const groups = groupBy(data ?? [], property);
    return Object.fromEntries(groups.entries());
}

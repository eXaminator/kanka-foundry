import groupBy from '../../util/groupBy';

type Args<T extends Record<string, unknown>> = Parameters<typeof groupBy<T>>;

export default function kankaGroupBy<T extends Record<string, unknown>>(
    data: Args<T>[0],
    property: Args<T>[1],
): Record<string, T[]> {
    const groups = groupBy<T>(data ?? [], property);
    return Object.fromEntries(groups.entries());
}

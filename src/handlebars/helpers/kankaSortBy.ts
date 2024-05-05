import sortBy from '../../util/sortBy';

export default function kankaSortBy<T extends Record<string, unknown>>(
    data: T[],
    ...fields: [...string[], Handlebars.HelperOptions]
): T[] {
    fields.pop(); // Remove options object
    return [...data].sort(sortBy(...(fields as string[])));
}

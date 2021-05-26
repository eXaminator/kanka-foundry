import kankaIsAccessible from './kankaIsAccessible';

type Options = Handlebars.HelperOptions;

export default function kankaFilterAccessible<T>(array: T[], options: Options): T[] {
    if (options.hash.ignore) return array;

    return array?.filter(entity => kankaIsAccessible(entity, options)) ?? [];
}

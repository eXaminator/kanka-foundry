import type { AnyConstrainable } from '../../types/kanka';
import kankaIsAccessible from './kankaIsAccessible';

type Options = Handlebars.HelperOptions;

export default function kankaFilterAccessible<T extends AnyConstrainable>(array: T[], options: Options): T[] {
    if (options.hash.ignore) return array;

    return array?.filter((entity) => kankaIsAccessible(entity, options)) ?? [];
}

import { KankaApiSimpleConstrainable, KankaApiVisibilityConstrainable } from '../../types/kanka';
import kankaIsAccessible from './kankaIsAccessible';

type Constrainable = KankaApiVisibilityConstrainable | KankaApiSimpleConstrainable;
type Options = Handlebars.HelperOptions;

export default function kankaFilterAccessible<T extends Constrainable>(array: T[], options: Options): T[] {
    if (options.hash.ignore) return array;

    return array?.filter(entity => kankaIsAccessible(entity, options)) ?? [];
}

import { KankaApiSimpleConstrainable, KankaApiVisibilityConstrainable } from '../../types/kanka';
import kankaFilterAccessible from './kankaFilterAccessible';

type Constrainable = KankaApiVisibilityConstrainable | KankaApiSimpleConstrainable;

export default function kankaHasOnlyPinned<T extends Constrainable>(
    array: T[],
    starProp: string,
    options: Handlebars.HelperOptions,
): boolean {
    const all = kankaFilterAccessible<T>(array, options);
    const starred = kankaFilterAccessible<T>(array, options).filter(entry => entry[starProp]);
    return all.length === starred.length;
}

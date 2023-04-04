import { AnyConstrainable } from '../../types/kanka';
import kankaFilterAccessible from './kankaFilterAccessible';

export default function kankaHasOnlyPinned<T extends AnyConstrainable>(
    array: T[],
    starProp: string,
    options: Handlebars.HelperOptions,
): boolean {
    const all = kankaFilterAccessible<T>(array, options);
    const starred = kankaFilterAccessible<T>(array, options).filter(entry => entry[starProp]);
    return all.length === starred.length;
}

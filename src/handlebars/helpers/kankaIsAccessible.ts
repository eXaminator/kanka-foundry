import { AnyConstrainable } from '../../types/kanka';
import isSecret from '../../util/isSecret';

export default function kankaIsAccessible(
    entity: AnyConstrainable,
    options: Handlebars.HelperOptions,
): boolean {
    if (options.data?.root?.owner) {
        return true;
    }

    return !isSecret(entity);
}

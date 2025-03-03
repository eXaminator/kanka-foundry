import type Reference from '../../types/Reference';
import type { KankaApiAnyId, KankaApiModuleType } from '../../types/kanka';
import resolveReference from '../../util/resolveReference';
import kankaIsAccessible from './kankaIsAccessible';

export default function kankaFindReference(
    id: KankaApiAnyId | undefined,
    typeParam: KankaApiModuleType | Handlebars.HelperOptions | undefined,
    optionsParam: Handlebars.HelperOptions | undefined,
): Reference | undefined {
    if (!id) return undefined;

    let type: KankaApiModuleType | undefined = typeParam as KankaApiModuleType;
    let options = optionsParam as Handlebars.HelperOptions;

    if (typeof typeParam === 'object') {
        options = typeParam;
        type = undefined;
    }

    const refMap = (options?.data?.root?.data?.system?.references ??
        options?.hash?.references ??
        {}) as unknown as Record<string, Reference>;

    const ref = resolveReference(id, type, refMap);

    if (ref && kankaIsAccessible(ref, options)) {
        return ref;
    }

    return undefined;
}

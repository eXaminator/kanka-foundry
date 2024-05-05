import type Reference from '../../types/Reference';
import type { KankaApiAnyId, KankaApiEntityType } from '../../types/kanka';
import kankaIsAccessible from './kankaIsAccessible';

export default function kankaFindReference(
    id: KankaApiAnyId | undefined,
    typeParam: KankaApiEntityType | Handlebars.HelperOptions | undefined,
    optionsParam: Handlebars.HelperOptions | undefined,
): Reference | undefined {
    if (!id) return undefined;

    let type: KankaApiEntityType | undefined = typeParam as KankaApiEntityType;
    let options = optionsParam as Handlebars.HelperOptions;

    if (typeof typeParam === 'object') {
        options = typeParam;
        type = undefined;
    }

    const refMap = (options?.data?.root?.data?.system?.references ??
        options?.hash?.references ??
        {}) as unknown as Record<string, Reference>;
    const ref = Object.values(refMap).find(
        (ref) => (ref.type === type && ref.id === id) || (!type && ref.entityId === id),
    );

    if (ref && kankaIsAccessible(ref, options)) {
        return ref;
    }

    return undefined;
}

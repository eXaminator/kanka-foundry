/* eslint-disable @typescript-eslint/no-explicit-any */
import { KankaApiEntityType } from '../../types/kanka';
import kankaFindReference from './kankaFindReference';
import kankaIsAccessible from './kankaIsAccessible';

export default function kankaFilterReferences(
    ...args: [any[]?, string?, KankaApiEntityType?, Handlebars.HelperOptions?]
): unknown[] {
    const options = args.pop() as Handlebars.HelperOptions;
    const [array, idProperty, type] = args;

    return array?.filter((entity) => {
        if (!kankaIsAccessible(entity, options)) return false;
        if (!idProperty) return true;

        const id = idProperty === 'this' ? entity : getProperty(entity, idProperty);
        if (options.hash?.optionalReference && !id) return true;

        const reference = kankaFindReference(id, type, options);
        if (!reference) return false;

        return kankaIsAccessible(reference, options);
    }) ?? [];
}

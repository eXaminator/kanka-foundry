import type { KankaApiModuleType } from '../../types/kanka';
import type Reference from '../../types/Reference';
import kankaFindReference from './kankaFindReference';
import kankaIsAccessible from './kankaIsAccessible';

export default function kankaFilterReferences(
    ...args: [Reference[]?, string?, KankaApiModuleType?, Handlebars.HelperOptions?]
): unknown[] {
    const options = args.pop() as Handlebars.HelperOptions;
    const [array, idProperty, type] = args;

    return (
        array?.filter((entity) => {
            if (!kankaIsAccessible(entity, options)) return false;
            if (!idProperty) return true;

            const id = idProperty === 'this' ? entity : foundry.utils.getProperty(entity, idProperty);
            if (options.hash?.optionalReference && !id) return true;

            const reference = kankaFindReference(id, type, options);
            if (!reference) return false;

            return kankaIsAccessible(reference, options);
        }) ?? []
    );
}

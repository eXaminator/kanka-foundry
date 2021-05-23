import kankaIsSecret from './kankaIsSecret';

export default function kankaIsAccessible(
    entity: unknown,
    options: Handlebars.HelperOptions,
): boolean {
    if (options.data?.root?.owner) {
        return true;
    }

    return !kankaIsSecret(entity, options);
}

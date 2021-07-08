/* eslint-disable @typescript-eslint/no-explicit-any */

export default function kankaLocalize(...args: unknown[]): string {
    const options = args.pop() as Record<string, any>;
    const data = options.hash ?? {};

    const parts = args.map((part) => {
        if (part === null || part === undefined) return 'notAvailable';
        if (typeof part === 'boolean') return part ? 'yes' : 'no';
        return String(part);
    });

    const key = ['KANKA', ...parts].join('.');

    const localization = options.data?.root?.localization ?? (game as Game).i18n;
    return isObjectEmpty(data) ? localization.localize(key) : localization.format(String(key), data);
}

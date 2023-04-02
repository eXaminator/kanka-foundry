/* eslint-disable @typescript-eslint/no-explicit-any */
import getGame from '../../foundry/getGame';

export default function kankaLocalize(...args: unknown[]): string {
    const options = args.pop() as Record<string, any>;
    const data = options.hash ?? {};

    const parts = args.map((part) => {
        if (part === null || part === undefined) return 'notAvailable';
        if (typeof part === 'boolean') return part ? 'yes' : 'no';
        return String(part);
    });

    const key = ['KANKA', ...parts].join('.');

    const localization = options.data?.root?.localization ?? getGame().i18n;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return foundry.utils.isEmpty(data) ? localization.localize(key) : localization.format(String(key), data);
}

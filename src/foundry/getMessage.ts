import getGame from './getGame';

export default function getMessage(
    ...args: [...string[], Record<string, unknown>] | string[]
): string {
    const values = args.slice(-1)[0];
    const keys = args.slice(0, -1);

    if (!values || typeof values === 'string') {
        return getGame().i18n.localize(`KANKA.${[...keys, values].join('.')}`);
    }

    return getGame().i18n.format(`KANKA.${keys.join('.')}`, values);
}

export default function getMessage(...args: [...string[], Record<string, string>] | string[]): string {
    const values = args.slice(-1)[0];
    const keys = args.slice(0, -1);

    if (!values || typeof values === 'string') {
        return game.i18n?.localize(`KANKA.${[...keys, values].join('.')}`) ?? '';
    }

    return game.i18n?.format(`KANKA.${keys.join('.')}`, values) ?? '';
}

const cachedArguments = new Map<string, never[]>();

export default function hmrWrapHook<K extends Hooks.HookName>(
    hook: K,
    getCb: () => Hooks.Function<K>,
    type: 'on' | 'once' = 'on',
): () => void {
    const eventHandler = ((...args: never[]): void => {
        cachedArguments.set(hook, args);
        (getCb() as (...a: never[]) => void)(...args);
    }) as Hooks.Function<K>;

    if (type === 'once') Hooks.once(hook, eventHandler);
    else if (type === 'on') Hooks.on(hook, eventHandler);

    return () => {
        const args = cachedArguments.get(hook) ?? [];
        (getCb() as (...a: never[]) => void)(...args);
    };
}

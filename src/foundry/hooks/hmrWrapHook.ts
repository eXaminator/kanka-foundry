const cachedArguments = new Map<string, never[]>();

type CallbackFn = (...args: never[]) => void;

export default function hmrWrapHook<T extends CallbackFn>(
    hook: string,
    getCb: () => T,
    type: 'on' | 'once' = 'on',
): () => void {
    function eventHandler(...args: Parameters<T>): void {
        cachedArguments.set(hook, args);
        getCb()(...args);
    }

    if (type === 'once') Hooks.once(hook, eventHandler);
    else if (type === 'on') Hooks.on(hook, eventHandler);

    return () => {
        const args = cachedArguments.get(hook) ?? [];
        getCb()(...args);
    };
}

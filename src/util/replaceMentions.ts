import { findEntryByEntityId } from '../foundry/journalEntries';

type EnrichOptions = Parameters<typeof TextEditor.enrichHTML>[1];

function replaceMentions(text: string): string {
    const el = $(`<div>${text}</div>`);

    el.find('a.entity-mention[data-id]').each((_, link): void => {
        const $link = $(link);
        const entityId = Number($link.data('id'));
        const label = $link.html();
        const journalEntry = findEntryByEntityId(entityId);

        if (journalEntry?.visible) {
            $link.replaceWith(journalEntry.link);
            return;
        }

        if (game.settings?.get('kanka-foundry', 'disableExternalMentionLinks')) {
            $link.replaceWith(label);
        }
    });

    return el.html();
}

function isObject(obj: unknown): obj is Record<string, unknown> {
    return typeof obj === 'object' && obj !== null;
}

export default async function replaceRecursiveMentions<T>(input: T, enrichOptions: EnrichOptions = {}): Promise<T> {
    if (typeof input === 'string') {
        return (await TextEditor.enrichHTML(replaceMentions(input), {
            ...enrichOptions,
            links: false,
        })) as unknown as Promise<T>;
    }

    if (Array.isArray(input)) {
        return Promise.all(input.map((value) => replaceRecursiveMentions(value, enrichOptions))) as Promise<T>;
    }

    if (isObject(input)) {
        const newObject: Record<string, unknown> = {};
        await Promise.all(
            Object.keys(input).map(async (key) => {
                newObject[key] = await replaceRecursiveMentions(input?.[key], enrichOptions);
            }),
        );

        return newObject as T;
    }

    return input;
}

import JournalEntryPageTextSheet = foundry.applications.sheets.journal.JournalEntryPageTextSheet;

import localization from '../../state/localization';
import type { JournalEntryPageSheetExt } from '../../types/journal-sheet-augments';
import replaceRecursiveMentions from '../../util/replaceMentions';

// Cast helper for accessing runtime properties not yet typed in fvtt-types stubs
function ext(instance: PostPageSheet): JournalEntryPageSheetExt {
    return instance as unknown as JournalEntryPageSheetExt;
}

// Get the parent prototype for calling super methods that aren't typed in the stubs
const parentProto = JournalEntryPageTextSheet.prototype as unknown as JournalEntryPageSheetExt;

export default class PostPageSheet extends JournalEntryPageTextSheet {
    static override DEFAULT_OPTIONS = {
        classes: ['kanka-post'],
    };

    static VIEW_PARTS = {
        content: {
            template: 'templates/journal/pages/text/view.hbs',
            root: true,
        },
    };

    get isEditable(): false {
        return false;
    }

    async _prepareContentContext(context: Record<string, unknown>, _options: unknown): Promise<void> {
        const text = context.text as { content: string; enriched?: string } | undefined;
        if (!text?.content) return;
        const doc = ext(this).document;
        context.owner = doc.isOwner;
        text.enriched = await replaceRecursiveMentions(text.content, {
            relativeTo: doc,
            secrets: doc.isOwner,
        });
    }

    // biome-ignore lint/suspicious/noExplicitAny: fvtt-types stubs are incomplete
    async _prepareContext(options: any): Promise<any> {
        const context = await parentProto._prepareContext.call(this, options);
        const name = context.name as string;
        if (name?.startsWith('KANKA.')) {
            context.name = localization.localize(name);
        }
        return context;
    }
}

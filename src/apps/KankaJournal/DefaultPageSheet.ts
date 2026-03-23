import JournalEntryPageHandlebarsSheet = foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet;

import localization from '../../state/localization';
import getImprovedReference from '../../util/getImprovedReference';
import replaceRecursiveMentions from '../../util/replaceMentions';
import type { JournalEntryPageSheetExt } from '../../types/journal-sheet-augments';
import type { KankaPageModel } from './models/KankaPageModel';

type SystemData = foundry.data.fields.SchemaField.InitializedData<KankaPageModel.Schema>;

const templates = import.meta.glob('./pages/*.hbs', { eager: true }) as Record<string, { default: string }>;

// Cast helper for accessing runtime properties not yet typed in fvtt-types stubs
function ext(instance: DefaultPageSheet): JournalEntryPageSheetExt {
    return instance as unknown as JournalEntryPageSheetExt;
}

// Get the parent prototype for calling super methods that aren't typed in the stubs
const parentProto = JournalEntryPageHandlebarsSheet.prototype as unknown as JournalEntryPageSheetExt;

export default class DefaultPageSheet extends JournalEntryPageHandlebarsSheet {
    get isEditable(): false {
        return false;
    }

    // biome-ignore lint/suspicious/noExplicitAny: fvtt-types stubs are incomplete
    _configureRenderParts(_options: any): Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> {
        return {
            content: {
                template: this.#resolveTemplate(),
                root: true,
            },
        };
    }

    async _prepareContentContext(context: Record<string, unknown>, _options: unknown): Promise<void> {
        const doc = ext(this).document;
        const system = doc.system as SystemData;
        const references = { ...system.references };

        await Promise.all(
            Object.keys(references).map(async (id) => {
                references[id] = await getImprovedReference(references[id]);
            }),
        );

        const snapshot = await replaceRecursiveMentions(system.snapshot, {
            relativeTo: doc,
            secrets: doc.isOwner,
        });

        if (Array.isArray(snapshot.parents)) {
            (snapshot.parents as Array<unknown>).reverse();
        }

        context.owner = doc.isOwner;
        context.data = {
            name: context.name,
            system: {
                ...system,
                snapshot,
                references,
            },
        };
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

    #resolveTemplate(): string {
        const doc = ext(this).document;
        const system = doc.system as SystemData;
        const entityType = system.type ?? 'common';
        const pageType = doc.type.split('.')[1];
        const template =
            templates[`./pages/${entityType}-${pageType}.hbs`] ?? templates[`./pages/common-${pageType}.hbs`];

        return template?.default ?? `./pages/${entityType}-${pageType}.hbs`;
    }
}

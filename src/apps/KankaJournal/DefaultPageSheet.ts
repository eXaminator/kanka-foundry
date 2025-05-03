import type { GetDataReturnType } from 'fvtt-types/utils';
import localization from '../../state/localization';
import type Reference from '../../types/Reference';
import getImprovedReference from '../../util/getImprovedReference';
import replaceRecursiveMentions from '../../util/replaceMentions';
import type { KankaPageModel } from './models/KankaPageModel';

type SystemData = foundry.data.fields.SchemaField.InitializedData<KankaPageModel.Schema>;

const templates = import.meta.glob('./pages/*.hbs', { eager: true }) as Record<string, { default: string }>;

export default class DefaultPageSheet extends JournalPageSheet<JournalPageSheet.Options> {
    public async getData(options) {
        const data = await super.getData(options) as JournalPageSheet.JournalPageSheetData;

        const name = data.data.name.startsWith('KANKA.') ? localization.localize(data.data.name) : data.data.name;
        const system = data.data.system as SystemData;
        const references = system.references;

        await Promise.all(Object.keys(system.references).map(async (id) => {
            references[id] = await getImprovedReference(system.references[id]);
        }));

        const snapshot = await replaceRecursiveMentions(system.snapshot, {
            relativeTo: this.object,
            secrets: this.object.isOwner,
        });

        if (Array.isArray(snapshot.parents)) {
            (snapshot.parents as Array<unknown>).reverse();
        }

        return {
            ...data,
            data: {
                ...data.data,
                name,
                system: {
                    ...(data.data.system as any),
                    snapshot,
                    references,
                },
            },
        };
    }

    get template(): string {
        const system = this.object.system as SystemData;
        const entityType = system.type ?? 'common';
        const pageType = this.object.type.split('.')[1];
        const template =
            templates[`./pages/${entityType}-${pageType}.hbs`] ?? templates[`./pages/common-${pageType}.hbs`];

        return template?.default ?? `./pages/${entityType}-${pageType}.hbs`;
    }
}

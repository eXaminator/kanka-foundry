import localization from '../../state/localization';
import Reference from '../../types/Reference';
import getImprovedReference from '../../util/getImprovedReference';
import replaceRecursiveMentions from '../../util/replaceMentions';

const templates = import.meta.glob('./pages/*.hbs', { eager: true }) as Record<string, { default: string }>;

type JournalPageSheetData = ReturnType<JournalPageSheet['getData']>;
type SheetOptions = Parameters<JournalPageSheet['getData']>[0];

export default class DefaultPageSheet extends JournalPageSheet {
    public async getData(options?: Partial<SheetOptions>): Promise<JournalPageSheetData> {
        const data = super.getData(options);
        data.data.name = data.data.name.startsWith('KANKA.') ? localization.localize(data.data.name) : data.data.name;

        await Promise.all(Object
            .keys((data.data.system?.references ?? {}) as Record<string, Reference & { link: Handlebars.SafeString }>)
            .map(async (id) => {
                data.data.system.references[id] = await getImprovedReference(data.data.system?.references[id]);
            }));

        data.data.system.snapshot = await replaceRecursiveMentions(data.data.system?.snapshot, {
            relativeTo: this.object,
            secrets: this.object.isOwner,
        });

        if (data.data.system.snapshot.parents) {
            data.data.system.snapshot.parents.reverse();
        }

        return data;
    }

    get template(): string {
        const entityType = this.object.system.type ?? 'common';
        const pageType = this.object.type.split('.')[1];
        const template = templates[`./pages/${entityType}-${pageType}.hbs`] ?? templates[`./pages/common-${pageType}.hbs`];

        return template?.default ?? `./pages/${entityType}-${pageType}.hbs`;
    }
}

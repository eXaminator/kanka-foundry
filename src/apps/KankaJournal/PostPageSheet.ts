import localization from '../../state/localization';
import replaceRecursiveMentions from '../../util/replaceMentions';

export default class PostPageSheet extends JournalTextPageSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            editable: false,
        });
    }

    async getData(options = {}) {
        const data = await super.getData(options) as any;

        data.editor.content = await replaceRecursiveMentions(data.data.text.content, {
            relativeTo: this.object,
            secrets: this.object.isOwner,
        });

        data.data.name = data.data.name.startsWith('KANKA.') ? localization.localize(data.data.name) : data.data.name;

        return data;
    }

    get template(): string {
        return 'templates/journal/page-text-view.html';
    }
}

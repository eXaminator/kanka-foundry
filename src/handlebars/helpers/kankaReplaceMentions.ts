import kanka from '../../kanka';
import createJournalLink from '../../util/createJournalLink';

export default function kankaReplaceMentions(text: string | null): Handlebars.SafeString | null {
    if (!text) return null;

    const url = new URL(kanka.baseUrl);
    const el = $(`<div>${text}</div>`);

    el.find(`a[data-id][href*="${url.hostname}"]`).each((_, link): void => {
        const $link = $(link);
        const entityId = Number($link.data('id'));
        const label = $link.html();
        const journalEntry = kanka.journals.findByEntityId(entityId);

        if (journalEntry?.visible) {
            $link.replaceWith(createJournalLink(journalEntry, label));
            return;
        }

        if (kanka.settings.disableExternalLinks) {
            $link.replaceWith(`<strong>${label}</strong>`);
        }
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return new Handlebars.SafeString(TextEditor.enrichHTML(el.html(), { async: false }));
}

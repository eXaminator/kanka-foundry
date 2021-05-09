import kanka from '../../kanka';
import createJournalLink from '../../util/createJournalLink';

export default function kankaReplaceMentions(text: string): Handlebars.SafeString {
    const el = $(`<div>${text}</div>`);

    el.find('a[data-id][href*="kanka.io"]').each((_, link): void => {
        const $link = $(link);
        const entityId = Number($link.data('id'));
        const label = $link.html();
        const journalEntry = kanka.journals.findByEntityId(entityId);

        if (journalEntry?.visible) {
            $link.replaceWith(createJournalLink(journalEntry, label));
            return;
        }

        if (kanka.settings.disableExternalLinks) {
            $link.replaceWith(label);
        }
    });

    return new Handlebars.SafeString(el.html());
}

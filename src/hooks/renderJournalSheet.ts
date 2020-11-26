import Campaign from '../kanka/entities/Campaign';
import moduleConfig from '../module.json';
import { findEntryByEntityId } from '../module/journal';

interface Options {
    entity: JournalEntry['data'],
}

export default async function renderJournalSheet(
    sheet: JournalSheet,
    html: JQuery,
    options?: Options,
): Promise<void> {
    html.on('click', '[data-id]', (event: JQuery.ClickEvent) => {
        const entityId = Number(event.currentTarget.dataset.id);
        const entry = findEntryByEntityId(entityId);

        if (entry) {
            event.stopImmediatePropagation();
            event.preventDefault();

            entry.sheet.render(true);
        }
    });

    const { entity } = options ?? {};
    const campaign = await game.modules.get(moduleConfig.name).loadCurrentCampaign() as Campaign;

    if (entity?.flags[moduleConfig.name]) {
        const contentElement = html.find('.editor-content');

        // Workaround for missing locale in links
        const parsedContent = contentElement.html().replace(
            'https://kanka.io/campaign',
            `https://kanka.io/${campaign.locale ?? 'en'}/campaign`,
        );

        contentElement.html(parsedContent);
    }
}

import Campaign from '../kanka/entities/Campaign';
import moduleConfig from '../module.json';
import { findEntryByEntityId } from '../module/journal';
import createKankaLink from '../util/createKankaLink';

interface Options {
    entity: JournalEntry['data'],
}

/**
 * Workaround: Fix all kanka links by adding a locale if it is missing
 */
function fixKankaLinks(html: JQuery, campaign: Campaign): void {
    const contentElement = html.find('.editor-content');

    // Workaround for missing locale in links
    const parsedContent = contentElement.html().replace(
        'https://kanka.io/campaign',
        `https://kanka.io/${campaign.locale ?? 'en'}/campaign`,
    );

    contentElement.html(parsedContent);
}

function addKankaEntityLink(html: JQuery, entity: EntityData): void {
    const { id, type, campaignId } = entity.flags[moduleConfig.name] ?? {};
    if (!type || !id || !campaignId) return;

    const link = createKankaLink(campaignId, type, id);

    html
        .find('.window-header .window-title')
        .after(`
    <a style="color: inherit; text-decoration: inherit;" class="header-button" href="${link}">
        <i class="fas fa-link"></i>Kanka
    </a>
`);
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
        fixKankaLinks(html, campaign);
        addKankaEntityLink(html, entity);
    }
}

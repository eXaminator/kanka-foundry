import api from '../kanka/api';
import Campaign from '../kanka/entities/Campaign';
import moduleConfig from '../module.json';
import { findEntryByEntityId } from '../module/journal';
import { KankaProfile } from '../types/kanka';
import createKankaLink from '../util/createKankaLink';

interface Options {
    entity: JournalEntry['data'],
}

/**
 * Workaround: Fix all kanka links by adding a locale if it is missing
 */
function fixKankaLinks(html: JQuery, profile: KankaProfile, campaign: Campaign): void {
    const contentElement = html.find('.editor-content');

    // Workaround for missing locale in links
    const parsedContent = contentElement.html().replace(
        'https://kanka.io/campaign',
        `https://kanka.io/${profile.locale || campaign.locale}/campaign`,
    );

    contentElement.html(parsedContent);
}

function addKankaEntityLink(html: JQuery, profile: KankaProfile, campaign: Campaign, entity: EntityData): void {
    const { id, type, campaignId } = entity.flags[moduleConfig.name] ?? {};
    if (!type || !id || !campaignId) return;

    const link = createKankaLink(campaignId, type, id, profile.locale || campaign.locale);

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
    const profile = await api.getProfile();

    if (entity?.flags[moduleConfig.name]) {
        fixKankaLinks(html, profile, campaign);
        addKankaEntityLink(html, profile, campaign, entity);
    }
}

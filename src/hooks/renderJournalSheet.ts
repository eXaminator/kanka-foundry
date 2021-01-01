import api from '../kanka/api';
import Campaign from '../kanka/entities/Campaign';
import moduleConfig from '../module.json';
import getSettings from '../module/getSettings';
import { findEntryByEntityId } from '../module/journal';
import { KankaProfile } from '../types/kanka';
import { KankaSettings } from '../types/KankaSettings';
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

function replaceMentionLinks(html: JQuery): void {
    html.find<HTMLAnchorElement>('a[data-id][href*="kanka.io"]').each((_, link) => {
        const entityId = Number(link.dataset.id);
        const entry = findEntryByEntityId(entityId);
        const removeLink = getSettings(KankaSettings.disableExternalMentionLinks);
        const $link = $(link);

        if (!entry && !removeLink) return;

        if (!entry) {
            $link.replaceWith($link.html());
            return;
        }

        $link
            .attr({
                draggable: 'true',
                'data-entity': 'JournalEntry',
                // eslint-disable-next-line no-underscore-dangle
                'data-id': entry._id,
                href: null,
            })
            .addClass('entity-link')
            .prepend('<i class="fas fa-book-open"></i> ');
    });
}

export default async function renderJournalSheet(
    sheet: JournalSheet,
    html: JQuery,
    options?: Options,
): Promise<void> {
    const { entity } = options ?? {};
    const campaign = await game.modules.get(moduleConfig.name).loadCurrentCampaign() as Campaign;
    const profile = await api.getProfile();

    if (entity?.flags[moduleConfig.name]) {
        fixKankaLinks(html, profile, campaign);
        addKankaEntityLink(html, profile, campaign, entity);
        replaceMentionLinks(html);
    }
}

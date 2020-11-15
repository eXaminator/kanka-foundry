/* eslint-disable class-methods-use-this */
import Campaign from '../kanka/Campaign';
import CampaignRepository from '../kanka/CampaignRepository';
import KankaEntity from '../kanka/KankaEntity';
import Location from '../kanka/Location';
import { logInfo } from '../logger';
import moduleConfig from '../module.json';
import KankaSettings from '../types/KankaSettings';
import getSettings from './getSettings';
import {
    ensureJournalFolder,
    findEntriesByType,
    findEntryByEntity,
    findEntryByTypeAndId,
    writeJournalEntry,
} from './journal';

interface TemplateData {
    campaign: Campaign;
    locations: Location[];
}

function sortBy<T>(name: keyof T): (a: T, b: T) => number {
    return (a: T, b: T) => String(a[name]).localeCompare(String(b[name]));
}

export default class KankaBrowser extends Application {
    static get defaultOptions(): ApplicationOptions {
        return mergeObject(super.defaultOptions, {
            id: 'kanka-browser',
            classes: ['kanka-foundry'],
            template: `modules/${moduleConfig.name}/templates/journal.html`,
            width: 720,
            height: 'auto',
            scrollY: ['.kanka-container'],
        });
    }

    getCampaign(): Promise<Campaign> {
        return game.modules.get(moduleConfig.name).loadCurrentCampaign();
    }

    get title(): string {
        return 'Kanka';
    }

    async getData(): Promise<TemplateData> {
        const campaign = await this.getCampaign();

        const [locations] = await Promise.all([
            campaign.locations.all(),
        ]);

        // eslint-disable-next-line prefer-arrow-callback
        Handlebars.registerHelper('kankaLink', (...parts: unknown[]) => {
            const path = parts.filter(p => typeof p !== 'object').join('');
            return `https://kanka.io/${campaign.locale}/campaign/${campaign.id}${path}`;
        });

        Handlebars.registerHelper('hasKankaJournalEntry', (entity: KankaEntity) => {
            const entry = findEntryByEntity(entity);
            return Boolean(entry);
        });

        Handlebars.registerHelper('hasLinkedJournalEntryOfType', (type: string) => {
            const entries = findEntriesByType(type);
            logInfo({ type, entries });
            return entries.length > 0;
        });

        return {
            campaign,
            locations: locations.sort(sortBy('name')),
        };
    }

    async activateListeners(html: JQuery): Promise<void> {
        super.activateListeners(html);
        const campaign = await this.getCampaign();

        html.on('click', '[data-action]', async (event) => {
            const action: string = event?.currentTarget?.dataset?.action;
            const id: string = event?.currentTarget?.dataset?.id;
            const type: string = event?.currentTarget?.dataset?.type;

            if (!action || !type) return;

            switch (action) {
                case 'sync-entry':
                case 'link-entry': {
                    if (!id) return;
                    const location = await campaign.locations.byId(Number(id), true);
                    if (!location) return;
                    await this.syncLocation(location, action === 'link-entry');
                    break;
                }

                case 'open-entry': {
                    if (!id) return;
                    const entry = findEntryByTypeAndId(type, Number(id));
                    entry?.sheet.render(true);
                    break;
                }

                case 'sync-folder':
                    await this.syncAllLocations();
                    break;

                case 'link-folder': {
                    await this.linkAllLocations();
                    break;
                }

                default:
                    // Fall through
                    break;
            }
        });
    }

    private async syncAllLocations(): Promise<void> {
        const campaign = await this.getCampaign();
        const locations = await campaign.locations.all(true);
        await ensureJournalFolder('location');

        const linkedLocations = locations.filter(location => !!findEntryByEntity(location));
        await Promise.all(linkedLocations.map(location => this.syncLocation(location, false, false)));
        ui.notifications.info(game.i18n.localize('KANKA.BrowserNotificationSyncedAllLocations'));
        this.render();
    }

    private async linkAllLocations(): Promise<void> {
        const campaign = await this.getCampaign();
        const locations = await campaign.locations.all(true);
        await ensureJournalFolder('location');

        const unlinkedLocations = locations.filter(location => !findEntryByEntity(location));
        await Promise.all(unlinkedLocations.map(location => this.syncLocation(location, false, false)));
        ui.notifications.info(game.i18n.localize('KANKA.BrowserNotificationSyncedAllLocations'));
        this.render();
    }

    private async syncLocation(location: Location, renderSheet = false, notification = true): Promise<void> {
        const data = {
            name: location.name,
            content: location.entry,
            img: location.image,
        };
        await writeJournalEntry(location, data, { renderSheet, notification });
        this.render();
    }
}

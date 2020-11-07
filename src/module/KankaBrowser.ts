/* eslint-disable class-methods-use-this */
import { logInfo } from '../logger';
import KankaSettings from '../types/KankaSettings';
import getSettings from './getSettings';
import { CampaignData, getCampaign, getLocations, LocationData } from './kanka';
import moduleConfig from '../module.json';

interface TemplateData {
    createLink: (path?: string) => string;
    campaign: CampaignData;
    locations: LocationData[];
}

interface JournalData {
    name: string;
    content: string;
    img?: string;
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

    get title(): string {
        return 'Kanka';
    }

    async getData(): Promise<TemplateData> {
        const campaignId = getSettings<string>(KankaSettings.campaign);

        const [campaign, locations] = await Promise.all([
            getCampaign(campaignId),
            getLocations(campaignId),
        ]);

        logInfo({ campaign });

        // eslint-disable-next-line prefer-arrow-callback
        Handlebars.registerHelper('kankaLink', (...parts: any[]) => {
            const path = parts.filter(p => typeof p !== 'object').join('');
            return `https://kanka.io/${campaign.locale}/campaign/${campaignId}${path}`;
        });

        Handlebars.registerHelper('hasKankaJournalEntry', (id: number) => {
            const entry = this.findEntry(id);
            return Boolean(entry);
        });

        Handlebars.registerHelper('getKankaJournalFolderName', (type: string) => {
            const folder = this.findFolder(type);
            return folder?.name;
        });

        return {
            createLink: (path?: string) => `https://kanka.io/${campaign.locale}/campaign/${campaignId}${path}`,
            campaign,
            locations: locations.sort(sortBy('name')),
        };
    }

    activateListeners(html: JQuery): void {
        super.activateListeners(html);
        html.on('click', '[data-action]', async (event) => {
            const action: string = event?.currentTarget?.dataset?.action;
            const id: string = event?.currentTarget?.dataset?.id;
            const type: string = event?.currentTarget?.dataset?.type;
            if (!action || !type) return;

            switch (action) {
                case 'sync-entry':
                case 'link-entry': {
                    if (!id) return;
                    const location = await this.findLocationById(Number(id));
                    if (!location) return;
                    await this.syncLocation(location, action === 'link-entry');
                    break;
                }

                case 'open-entry': {
                    if (!id) return;
                    const entry = this.findEntry(Number(id));
                    entry?.sheet.render(true);
                    break;
                }

                case 'sync-folder':
                case 'link-folder': {
                    await this.syncAllLocations();
                    break;
                }

                default:
                    // Fall through
                    break;
            }
        });
    }

    private findEntry(id: number): JournalEntry | undefined {
        return game.journal.find(e => e.getFlag(moduleConfig.name, 'id') === id);
    }

    private findFolder(type: string): Folder | undefined {
        return game.folders
            .find((f: Folder) => f.data.type === 'JournalEntry' && f.getFlag(moduleConfig.name, 'type') === type);
    }

    private async findLocationById(id: number): Promise<LocationData | undefined> {
        const { locations } = await this.getData();
        const location = locations.find(l => l.id === id);

        if (!location) {
            ui.notifications.error(game.i18n.format('KANKA.BrowserErrorLocationNotFound', { id }));
        }

        return location;
    }

    private async syncAllLocations(): Promise<void> {
        const { locations } = await this.getData();

        await this.ensureJournalFolder('location');
        await Promise.all(locations.map(location => this.syncLocation(location, false, false)));
        ui.notifications.info(game.i18n.localize('KANKA.BrowserNotificationSyncedAllLocations'));
        this.render();
    }

    private async syncLocation(location: LocationData, renderSheet = false, notification = true): Promise<void> {
        const data: JournalData = {
            name: location.name,
            content: location.entry,
            img: location.has_custom_image ? location.image_full : undefined,
        };
        await this.writeJournalEntry(location.id, 'location', data, renderSheet, notification);
        this.render();
    }

    private async ensureJournalFolder(type: string): Promise<Folder | undefined> {
        let folder = this.findFolder(type);

        if (!folder) {
            folder = await Folder.create({
                name: `[Kanka] ${type}`, // use translation
                type: 'JournalEntry',
                parent: null,
                [`flags.${moduleConfig.name}.type`]: type,
            });
        }

        return folder;
    }

    private async writeJournalEntry(
        id: number,
        type: string,
        data: JournalData,
        renderSheet = false,
        notification = true,
    ): Promise<JournalEntry> {
        let entry = this.findEntry(id);

        if (entry) {
            await entry.update(data);
            if (notification) ui.notifications.info(game.i18n.format('KANKA.BrowserNotificationRefreshed', { type, name: data.name }));
        } else {
            const folder = await this.ensureJournalFolder('location');
            entry = await JournalEntry.create({
                ...data,
                folder: folder?.id,
                [`flags.${moduleConfig.name}.id`]: id,
                [`flags.${moduleConfig.name}.type`]: type,
            }, { renderSheet }) as JournalEntry;
            if (notification) ui.notifications.info(game.i18n.format('KANKA.BrowserNotificationSynced', { type, name: data.name }));
        }

        return entry;
    }
}

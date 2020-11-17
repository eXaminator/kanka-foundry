import Campaign from '../kanka/Campaign';
import KankaEntity from '../kanka/KankaEntity';
import moduleConfig from '../module.json';
import {
    ensureJournalFolder,
    findEntriesByType,
    findEntryByEntity,
    findEntryByEntityId,
    writeJournalEntry,
} from './journal';

interface EntityList {
    items: KankaEntity[];
    icon: string;
    isOpen: boolean;
}

interface TemplateData {
    campaign: Campaign;
    data: Record<string, EntityList>;
}

const entityTypes = {
    character: {
        icon: 'fa-user',
    },
    family: {
        icon: 'fa-users',
    },
    item: {
        icon: 'fa-gavel',
    },
    event: {
        icon: 'fa-calendar',
    },
    location: {
        icon: 'fa-compass',
    },
    note: {
        icon: 'fa-clipboard',
    },
    organisation: {
        icon: 'fa-sitemap',
    },
    race: {
        icon: 'fa-pastafarianism',
    },
};

function sortBy<T>(name: keyof T): (a: T, b: T) => number {
    return (a: T, b: T) => String(a[name]).localeCompare(String(b[name]));
}

function getLocalStorageKey(type: string): string {
    return `Kanka.KankaBrowser.detailsState.${type}`;
}

function getOpenStateFromLocalStorage(type: string): boolean {
    return window.localStorage.getItem(getLocalStorageKey(type)) === 'true';
}

function setOpenStateToLocalStorage(type: string, open: boolean): void {
    window.localStorage.setItem(getLocalStorageKey(type), open ? 'true' : 'false');
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

    async getCampaign(): Promise<Campaign> {
        try {
            return await game.modules.get(moduleConfig.name).loadCurrentCampaign();
        } catch (e) {
            this.showError('Error.fetchError');
            throw e;
        }
    }

    get title(): string {
        return 'Kanka';
    }

    async getData(): Promise<TemplateData> {
        const campaign = await this.getCampaign();

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
            return entries.length > 0;
        });

        Handlebars.registerHelper(
            'i18nKey',
            (...parts: unknown[]) => parts.filter(p => typeof p !== 'object').join('.'),
        );

        const types = Object.keys(entityTypes);
        const lists = await Promise.all(types.map(type => campaign.getByType(type)?.all()));
        const data = {};
        types.forEach((type, index) => {
            data[type] = {
                ...entityTypes[type],
                items: lists[index]?.sort(sortBy('name')),
                isOpen: getOpenStateFromLocalStorage(type),
            };
        });

        return {
            campaign,
            data,
        };
    }

    async activateListeners(html: JQuery): Promise<void> {
        super.activateListeners(html);
        const campaign = await this.getCampaign();

        html.find<HTMLDetailsElement>('details[data-type]').on('toggle', (event) => {
            const type = event.currentTarget.dataset?.type;
            if (!type) return;
            setOpenStateToLocalStorage(type, event.currentTarget.open);
        });

        html.on('click', '[data-action]', async (event) => {
            const action: string = event?.currentTarget?.dataset?.action;
            const id: string = event?.currentTarget?.dataset?.id;
            const entityId: string = event?.currentTarget?.dataset?.entityId;
            const type: string = event?.currentTarget?.dataset?.type;

            if (!action) return;

            switch (action) {
                case 'sync-entry':
                case 'link-entry': {
                    if (!id || !type) return;
                    const entity = await campaign.getByType(type)?.byId(Number(id), true);
                    if (!entity) return;
                    await this.syncEntity(entity, action === 'link-entry');
                    break;
                }

                case 'open-entry': {
                    if (!entityId) return;
                    const entry = findEntryByEntityId(Number(entityId));
                    entry?.sheet.render(true);
                    break;
                }

                case 'sync-folder':
                    if (!type) return;
                    await this.syncFolder(type);
                    break;

                case 'link-folder': {
                    await this.linkFolder(type);
                    break;
                }

                default:
                    // Fall through
                    break;
            }
        });
    }

    private async syncFolder(type: string): Promise<void> {
        const campaign = await this.getCampaign();
        const entities = await campaign.getByType(type)?.all(true);
        if (!entities) {
            this.showError('BrowserSyncError');
            return;
        }

        await ensureJournalFolder(type);

        const linkedEntities = entities.filter(entity => !!findEntryByEntity(entity));
        await Promise.all(linkedEntities.map(entity => this.syncEntity(entity, false, false)));
        this.showInfo('BrowserNotificationSyncedFolder', { type });
        this.render();
    }

    private async linkFolder(type: string): Promise<void> {
        const campaign = await this.getCampaign();
        const entities = await campaign.getByType(type)?.all(true);
        if (!entities) {
            this.showError('BrowserSyncError');
            return;
        }

        await ensureJournalFolder(type);

        const unlinkedEntities = entities.filter(entity => !findEntryByEntity(entity));
        await Promise.all(unlinkedEntities.map(entity => this.syncEntity(entity, false, false)));
        this.showInfo('BrowserNotificationLinkedFolder', { type });
        this.render();
    }

    private async syncEntity(entity: KankaEntity, renderSheet = false, notification = true): Promise<void> {
        await writeJournalEntry(entity, { renderSheet, notification });
        this.render();
    }

    private showInfo(msg: string, params?: Record<string, unknown>): void {
        const key = `KANKA.${msg}`;
        const text = params ? game.i18n.format(key, params) : game.i18n.localize(key);
        ui.notifications.info(text);
    }

    private showError(msg: string, params?: Record<string, unknown>): void {
        const key = `KANKA.${msg}`;
        const text = params ? game.i18n.format(key, params) : game.i18n.localize(key);
        ui.notifications.error(text);
    }
}

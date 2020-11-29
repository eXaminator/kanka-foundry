import Campaign from '../kanka/entities/Campaign';
import PrimaryEntity from '../kanka/entities/PrimaryEntity';
import { logError } from '../logger';
import moduleConfig from '../module.json';
import EntityType from '../types/EntityType';
import { kankaImportTypeSetting, KankaSettings } from '../types/KankaSettings';
import getSetting from './getSettings';
import { findEntriesByType, findEntryByEntity, findEntryByEntityId, hasOutdatedEntry, writeJournalEntry } from './journal';

interface EntityList {
    items: PrimaryEntity[];
    icon: string;
    isOpen: boolean;
}

interface TemplateData {
    campaign: Campaign;
    data: Record<string, EntityList>;
}

const entityTypes: Partial<Record<EntityType, { icon: string }>> = {
    [EntityType.ability]: {
        icon: 'fa-fire',
    },
    [EntityType.character]: {
        icon: 'fa-user',
    },
    [EntityType.event]: {
        icon: 'fa-bolt',
    },
    [EntityType.family]: {
        icon: 'fa-users',
    },
    [EntityType.item]: {
        icon: 'fa-crown',
    },
    [EntityType.journal]: {
        icon: 'fa-feather-alt',
    },
    [EntityType.location]: {
        icon: 'fa-chess-rook',
    },
    [EntityType.note]: {
        icon: 'fa-book-open',
    },
    [EntityType.organisation]: {
        icon: 'fa-theater-masks',
    },
    [EntityType.quest]: {
        icon: 'fa-map-signs',
    },
    [EntityType.race]: {
        icon: 'fa-dragon',
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
        // Clear cache on every reload to ensure that the lists always shows all current elements
        const campaign = await this.getCampaign();

        Handlebars.registerHelper('kankaLink', (type?: string, id?: number) => {
            const parts = [`https://kanka.io/${campaign.locale ?? 'en'}/campaign/${campaign.id}`];

            if (type && typeof type !== 'object') {
                parts.push(`${type.replace(/y$/, 'ie')}s`);
            }

            if (id && typeof id !== 'object') {
                parts.push(String(id));
            }

            return parts.join('/');
        });

        Handlebars.registerHelper('hasKankaJournalEntry', (entity: PrimaryEntity) => {
            const entry = findEntryByEntity(entity);
            return Boolean(entry);
        });

        Handlebars.registerHelper('hasUpdatedKankaJournalEntry', (entity: PrimaryEntity) => hasOutdatedEntry(entity));

        Handlebars.registerHelper('hasLinkedJournalEntryOfType', (type: string) => {
            const entries = findEntriesByType(type);
            return entries.length > 0;
        });

        Handlebars.registerHelper(
            'i18nKey',
            (...parts: unknown[]) => parts.filter(p => typeof p !== 'object').join('.'),
        );

        return { campaign } as TemplateData;
    }

    private async loadEntityListData(
        campaign: Campaign,
        types: EntityType[],
    ): Promise<Partial<Record<EntityType, PrimaryEntity[]>>> {
        const lists = await Promise.all(types.map(type => campaign.getByType(type)?.all()));

        const result: Partial<Record<EntityType, PrimaryEntity[]>> = {};

        types.forEach((type, index) => {
            result[type] = lists[index];
        });

        return result;
    }

    private async renderEntityTemplate(lists: Partial<Record<EntityType, PrimaryEntity[]>>): Promise<string> {
        const data = {};
        const allowPrivate = getSetting(KankaSettings.importPrivateEntities) as boolean;

        Object
            .entries(lists)
            .forEach(([type, list]) => {
                if (!list) return;

                const items = list
                    .filter(item => allowPrivate || !item.isPrivate)
                    .sort(sortBy('name'));

                if (!items?.length) {
                    return;
                }

                data[type] = {
                    ...entityTypes[type],
                    isOpen: getOpenStateFromLocalStorage(type),
                    items,
                };
            });

        return await renderTemplate(
            `modules/${moduleConfig.name}/templates/entityList.html`,
            { data },
        ) as unknown as string;
    }

    private async loadAndRenderEntityLists(html: JQuery): Promise<void> {
        const campaign = await this.getCampaign();

        const types = Object
            .keys(entityTypes)
            .filter(type => getSetting(kankaImportTypeSetting(type as EntityType))) as EntityType[];

        const lists = await this.loadEntityListData(campaign, types);
        const htmlString = await this.renderEntityTemplate(lists);

        html.find('.kanka-entity-list').replaceWith(htmlString);

        html.find<HTMLDetailsElement>('details[data-type]').on('toggle', (event) => {
            const type = event.currentTarget.dataset?.type;
            if (!type) return;
            setOpenStateToLocalStorage(type, event.currentTarget.open);
            this.setPosition({ height: 'auto' });
        });

        this.setPosition({ height: 'auto' });
    }

    async activateListeners(html: JQuery): Promise<void> {
        super.activateListeners(html);
        this.loadAndRenderEntityLists(html).catch(e => logError(e));

        const campaign = await this.getCampaign();

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
                    const entity = await campaign.getByType(type)?.byId(Number(id));
                    if (!entity) return;
                    await this.syncEntity(entity, action === 'link-entry');
                    this.render();
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
                    this.render();
                    break;

                case 'link-folder': {
                    if (!type) return;
                    await this.linkFolder(type);
                    this.render();
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
        const entities = await campaign.getByType(type)?.all();
        if (!entities) {
            this.showError('BrowserSyncError');
            return;
        }

        const linkedEntities = entities.filter(entity => !!findEntryByEntity(entity));
        await this.syncEntities(linkedEntities);
        this.showInfo('BrowserNotificationSyncedFolder', { type });
        this.render();
    }

    private async linkFolder(type: string): Promise<void> {
        const campaign = await this.getCampaign();
        const entities = await campaign.getByType(type)?.all();
        if (!entities) {
            this.showError('BrowserSyncError');
            return;
        }

        const unlinkedEntities = entities.filter(entity => !findEntryByEntity(entity));
        await this.syncEntities(unlinkedEntities);
        this.showInfo('BrowserNotificationLinkedFolder', { type });
        this.render();
    }

    private async syncEntities(entities: PrimaryEntity[]): Promise<void> {
        for (let i = 0; i < entities.length; i += 1) {
            // eslint-disable-next-line no-await-in-loop
            await this.syncEntity(entities[i], false, false);
        }
    }

    private async syncEntity(entity: PrimaryEntity, renderSheet = false, notification = true): Promise<void> {
        await writeJournalEntry(entity, { renderSheet, notification });
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

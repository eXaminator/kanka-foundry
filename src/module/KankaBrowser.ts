import api from '../kanka/api';
import Campaign from '../kanka/entities/Campaign';
import PrimaryEntity from '../kanka/entities/PrimaryEntity';
import { logError } from '../logger';
import moduleConfig from '../module.json';
import EntityType from '../types/EntityType';
import { KankaApiEntityId, KankaProfile } from '../types/kanka';
import { kankaBrowserTypeCollapseSetting, kankaImportTypeSetting, KankaSettings } from '../types/KankaSettings';
import sortBy from '../util/sortBy';
import { getSetting, setSetting } from './accessSettings';

interface EntityList {
    items: PrimaryEntity[];
    icon: string;
    isOpen: boolean;
}

interface TemplateData {
    campaign: Campaign;
    profile: KankaProfile;
}

interface EntityListData extends TemplateData {
    data: Record<string, EntityList>;
    currentFilter: string;
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

export default abstract class KankaBrowser extends Application {
    #currentFilter = '';
    #profile: KankaProfile | undefined;

    protected localization = game.i18n;

    constructor(options?: ApplicationOptions) {
        super(options);

        this.initializeLocalization().catch(() => this.showError('BrowserSyncError')); // TODO: Different error Message
    }

    static get defaultOptions(): ApplicationOptions {
        return mergeObject(super.defaultOptions, {
            id: 'kanka-browser',
            classes: ['kanka-foundry'],
            template: `modules/${moduleConfig.name}/templates/kankaBrowser.html`,
            width: 720,
            height: 'auto',
            scrollY: ['.kanka-container'],
        });
    }

    private async initializeLocalization(): Promise<void> {
        const targetLanguage = getSetting(KankaSettings.importLanguage) as string;

        if (targetLanguage !== this.localization.lang) {
            this.localization = new Localization();
            await this.localization.initialize();
            await this.localization.setLanguage(targetLanguage);
        }
    }

    protected abstract syncEntity(entity: PrimaryEntity): Promise<void>;
    protected abstract linkEntity(entity: PrimaryEntity): Promise<void>;
    protected abstract syncType(type: EntityType): Promise<void>;
    protected abstract linkType(type: EntityType): Promise<void>;
    protected abstract syncAll(): Promise<void>;
    protected abstract openEntry(entityId: KankaApiEntityId): Promise<void>;

    protected async getCampaign(): Promise<Campaign> {
        try {
            return await game.modules.get(moduleConfig.name).loadCurrentCampaign();
        } catch (e) {
            this.showError('Error.fetchError');
            throw e;
        }
    }

    protected async getProfile(): Promise<KankaProfile> {
        if (!this.#profile) {
            this.#profile = await api.getProfile();
        }

        return this.#profile;
    }

    protected async getEntitiesByType<T extends PrimaryEntity>(type: EntityType): Promise<T[]> {
        const campaign = await this.getCampaign();
        const entities = await campaign.getByType(type)?.all();

        if (!entities) {
            this.showError('BrowserSyncError');
            return [];
        }

        return entities;
    }

    public async getData(): Promise<TemplateData> {
        return {
            campaign: await this.getCampaign(),
            profile: await this.getProfile(),
        };
    }

    protected async loadEntityListData(
        campaign: Campaign,
    ): Promise<Partial<Record<EntityType, PrimaryEntity[]>>> {
        const types = Object
            .keys(entityTypes)
            .filter(type => getSetting(kankaImportTypeSetting(type as EntityType))) as EntityType[];

        const lists = await Promise.all(types.map(type => campaign.getByType(type)?.all()));
        const result: Partial<Record<EntityType, PrimaryEntity[]>> = {};

        types.forEach((type, index) => {
            result[type] = lists[index];
        });

        return result;
    }

    protected async renderEntityTemplate(lists: Partial<Record<EntityType, PrimaryEntity[]>>): Promise<string> {
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
                    isOpen: getSetting(kankaBrowserTypeCollapseSetting(type)),
                    items,
                };
            });

        const templateData: EntityListData = {
            data,
            currentFilter: this.#currentFilter,
            campaign: await this.getCampaign(),
            profile: await this.getProfile(),
        };

        return await renderTemplate(
            `modules/${moduleConfig.name}/templates/entityList.html`,
            templateData,
        ) as unknown as string;
    }

    protected async loadAndRenderEntityLists(html: JQuery): Promise<void> {
        const campaign = await this.getCampaign();

        const lists = await this.loadEntityListData(campaign);
        const htmlString = await this.renderEntityTemplate(lists);

        html.find('.kanka-entity-list').replaceWith(htmlString);

        html.find<HTMLDetailsElement>('details[data-type]').on('toggle', (event) => {
            const type = event.currentTarget.dataset?.type as EntityType;
            if (!type) return;
            this.setPosition({ height: 'auto' });
            if (this.#currentFilter) return; // Don't save toggle if filter is active
            setSetting(kankaBrowserTypeCollapseSetting(type), event.currentTarget.open);
        });

        this.filterList(this.#currentFilter);
    }

    async activateListeners(html: JQuery): Promise<void> {
        super.activateListeners(html);
        this.loadAndRenderEntityLists(html).catch(e => logError(e));

        const campaign = await this.getCampaign();

        html.on('input', '[name="filter"]', (event) => {
            const filter = event?.target?.value ?? '';

            if (!filter.trim().length) {
                this.resetFilter();
                return;
            }

            this.filterList(filter);
        });

        html.on('click', '[data-action]', async (event) => {
            const button = $(event.currentTarget);
            const { action, id, entityId, type } = event.currentTarget?.dataset ?? {};
            if (!action) return;

            try {
                switch (action) {
                    case 'sync-entry': {
                        if (!id || !type) return;
                        const entity = await campaign.getByType(type)?.byId(Number(id));
                        if (!entity) return;
                        this.setLoadingState(button);
                        await this.syncEntity(entity);
                        this.showInfo('BrowserNotificationSynced', { type: entity.entityType, name: entity.name });
                        this.render();
                        break;
                    }

                    case 'link-entry': {
                        if (!id || !type) return;
                        const entity = await campaign.getByType(type)?.byId(Number(id));
                        if (!entity) return;
                        this.setLoadingState(button);
                        await this.linkEntity(entity);
                        this.showInfo('BrowserNotificationSynced', { type: entity.entityType, name: entity.name });
                        this.render();
                        break;
                    }

                    case 'sync-all':
                        this.setLoadingState(button);
                        await this.syncAll();
                        this.showInfo('BrowserNotificationSyncedAll');
                        this.render();
                        break;

                    case 'sync-folder':
                        if (!type) return;
                        this.setLoadingState(button);
                        await this.syncType(type);
                        this.showInfo('BrowserNotificationSyncedFolder', { type });
                        this.render();
                        break;

                    case 'link-folder':
                        if (!type) return;
                        this.setLoadingState(button);
                        await this.linkType(type);
                        this.showInfo('BrowserNotificationLinkedFolder', { type });
                        this.render();
                        break;

                    case 'open-entry':
                        if (!entityId) return;
                        await this.openEntry(entityId);
                        break;

                    default:
                        // Fall through
                        break;
                }
            } catch (error) {
                this.showError('BrowserSyncError');
                this.render();
            }
        });
    }

    protected showInfo(msg: string, params?: Record<string, unknown>): void {
        const key = `KANKA.${msg}`;
        const text = params ? game.i18n.format(key, params) : game.i18n.localize(key);
        ui.notifications.info(text);
    }

    protected showError(msg: string, params?: Record<string, unknown>): void {
        const key = `KANKA.${msg}`;
        const text = params ? game.i18n.format(key, params) : game.i18n.localize(key);
        ui.notifications.error(text);
    }

    protected resetFilter(): void {
        const element = $(this.element);
        this.#currentFilter = '';
        element.find('[data-filter-text]').show();
        element.find<HTMLDetailsElement>('details[data-type]')
            .each((_, el) => {
                // eslint-disable-next-line no-param-reassign
                el.open = getSetting(kankaBrowserTypeCollapseSetting(el.dataset?.type ?? ''));
            });

        this.setPosition({ height: 'auto' });
    }

    protected filterList(filter: string): void {
        if (!filter) {
            this.resetFilter();
            return;
        }

        const element = $(this.element);

        this.#currentFilter = filter
            .toLowerCase()
            .replace(/\[/g, '\\[')
            .replace(/\]/g, '||]')
            .replace(/"/g, '\\"');

        element.find<HTMLDetailsElement>('details[data-type]')
            // eslint-disable-next-line no-param-reassign
            .each((_, el) => { el.open = true; });

        element.find('[data-filter-text]').hide();
        element.find(`[data-filter-text*="${this.#currentFilter}"]`).show();
        this.setPosition({ height: 'auto' });
    }

    protected getImportableEntityTypes(): EntityType[] {
        return Object.values(EntityType)
            .filter((t) => {
                try {
                    return getSetting(kankaImportTypeSetting(t));
                } catch (e) {
                    return false; // Setting does not exist
                }
            });
    }

    protected setLoadingState(button: JQuery): void {
        const icon = button.find('i');

        if (icon.length === 0) {
            button.prepend('<div class="loading-indicator inline"><i class="fas fa-spinner"></i></div>');
        } else {
            icon.replaceWith('<div class="loading-indicator inline"><i class="fas fa-spinner"></i></div>');
        }

        $(this.element).find('[data-action*="sync"], [data-action*="link"]').prop('disabled', true);
    }
}

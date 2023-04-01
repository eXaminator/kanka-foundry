import { logError, logInfo } from '../module/logger';
import api from '../module/api';
import { getCurrentCampaign } from '../module/currentCampaign';
import getMessage from '../module/getMessage';
import { findAllKankaEntries, findEntryByEntityId, getEntryFlag, hasOutdatedEntryByEntity } from '../module/journalEntries';
import { showError } from '../module/notifications';
import { KankaSettings, getSetting, setSetting } from '../module/settings';
import syncEntities from '../module/syncEntities';
import EntityType from '../types/EntityType';
import { KankaApiCampaign, KankaApiChildEntity, KankaApiEntity, KankaApiId } from '../types/kanka';
import { ProgressFn } from '../types/progress';
import template from './KankaBrowserApplication.hbs';
import './KankaBrowserApplication.scss';

interface EntityTypeConfig {
    icon: string;
    isOpen: boolean;
}

interface TemplateData {
    campaign?: KankaApiCampaign;
    kankaCampaignId?: KankaApiId;
    data?: KankaApiEntity[];
    typeConfig: Record<string, EntityTypeConfig>,
    currentFilter: string;
    deletedEntries: KankaApiChildEntity[];
    settings: {
        showPrivate: boolean;
        view: KankaSettings['browserView'];
    },
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

export default class KankaBrowserApplication extends Application {
    #currentFilter = '';
    #entities: KankaApiEntity[] | undefined;

    static get defaultOptions(): ApplicationOptions {
        return {
            ...super.defaultOptions,
            id: 'kanka-browser',
            classes: ['kanka', 'kanka-browser'],
            template,
            width: 720,
            height: 'auto',
            title: getMessage('browser.title'),
            tabs: [{ navSelector: '.tabs', contentSelector: '.tab-container', initial: 'import' }],
            resizable: true,
        };
    }

    protected get campaign(): KankaApiCampaign {
        const campaign = getCurrentCampaign();

        if (!campaign) throw new Error('Campaign has not been loaded yet.');
        return campaign;
    }

    protected get deletedSnapshots(): KankaApiChildEntity[] {
        return findAllKankaEntries()
            .flatMap((entry) => {
                const campaignId = getEntryFlag(entry, 'campaign');
                const snapshot = getEntryFlag(entry, 'snapshot');

                if (!snapshot) return [];
                if (!this.#entities) return [];
                if (campaignId !== this.campaign.id) return [];
                if (this.#entities.some(e => e.id === snapshot.entity_id)) return [];

                return [snapshot];
            });
    }

    public getData(): TemplateData {
        const typeConfig = {};

        Object
            .entries(entityTypes)
            .forEach(([type, cfg]) => {
                typeConfig[type] = {
                    ...cfg,
                    isOpen: true,
                };
            });

        return {
            ...super.getData(),
            campaign: this.campaign,
            kankaCampaignId: this.campaign.id,
            currentFilter: this.#currentFilter,
            typeConfig,
            data: this.#entities,
            deletedEntries: this.deletedSnapshots,
            settings: {
                showPrivate: getSetting('importPrivateEntities'),
                view: getSetting('browserView'),
            },
        };
    }

    public async activateListeners(html: JQuery): Promise<void> {
        super.activateListeners(html);
        this.filterList(this.#currentFilter);

        html.on('input', '[name="filter"]', (event) => {
            const filter = event?.target?.value ?? '';

            if (!filter.trim().length) {
                this.resetFilter();
                return;
            }

            this.filterList(filter);
        });

        html.on('click', 'button[data-action]', async (event) => {
            const { action, id: idString, type } = event.currentTarget?.dataset ?? {};
            const id = parseInt(idString, 10);

            logInfo('click', { action, id }, this.campaign);

            try {
                switch (action) {
                    case 'view-grid': {
                        await setSetting('browserView', 'grid');
                        this.render();
                        break;
                    }

                    case 'view-list': {
                        await setSetting('browserView', 'list');
                        this.render();
                        break;
                    }

                    case 'open': {
                        const sheet = findEntryByEntityId(id)?.sheet;
                        sheet?.render(true);
                        sheet?.maximize();
                        break;
                    }

                    case 'sync': {
                        const entity = this.#entities?.find(e => e.id === id);
                        if (!entity) return;
                        this.setLoadingState(event.currentTarget);
                        await syncEntities(this.campaign.id, [entity], this.#entities ?? []);
                        this.render();
                        break;
                    }

                    case 'link-type': {
                        if (!type) return;
                        const unlinkedEntities = this.#entities?.filter((entity) => {
                            if (entity.type !== type) return false;
                            return !findEntryByEntityId(entity.id);
                        }) ?? [];

                        const updateProgress = this.setLoadingState(event.currentTarget, true);
                        await syncEntities(this.campaign.id, unlinkedEntities, this.#entities ?? [], updateProgress);
                        this.render();
                        break;
                    }

                    case 'link-all': {
                        const unlinkedEntities = this.#entities
                            ?.filter(entity => !findEntryByEntityId(entity.id)) ?? [];

                        const updateProgress = this.setLoadingState(event.currentTarget, true);
                        await syncEntities(this.campaign.id, unlinkedEntities, this.#entities ?? [], updateProgress);
                        this.render();
                        break;
                    }

                    case 'update-outdated': {
                        const outdatedEntities = this.#entities?.filter((entity) => {
                            if (!hasOutdatedEntryByEntity(entity)) {
                                return false;
                            }

                            return !type || entity.type === type;
                        }) ?? [];

                        const updateProgress = this.setLoadingState(event.currentTarget, true);
                        await syncEntities(this.campaign.id, outdatedEntities, this.#entities ?? [], updateProgress);
                        this.render();
                        break;
                    }

                    case 'delete': {
                        const entry = findEntryByEntityId(id);
                        await entry?.delete({});
                        break;
                    }

                    case 'delete-all': {
                        await Promise.all(this.deletedSnapshots.map(async (snapshot) => {
                            const entry = findEntryByEntityId(snapshot.entity_id);
                            await entry?.delete({});
                        }));
                        break;
                    }

                    default:
                        break;
                }
            } catch (error) {
                logError(error);
                showError('browser.error.actionError');
                this.render(); // Ensure loaders are removed etc.
            }
        });

        html.find<HTMLDetailsElement>('details[data-type]').on('toggle', (event) => {
            const type = event.currentTarget.dataset?.type as EntityType;
            if (!type) return;
            this.setPosition({ ...this.position, height: 'auto' });
            if (this.#currentFilter) return; // Don't save toggle if filter is active
            setSetting(`collapseType_${type}`, event.currentTarget.open);
        });
    }

    protected resetFilter(): void {
        const element = $(this.element);
        this.#currentFilter = '';
        element.find('[data-filter-text]').show();

        element.find<HTMLDetailsElement>('details[data-type]')
            .each((_, el) => {
                if (el.dataset?.type) {
                    // eslint-disable-next-line no-param-reassign
                    el.open = getSetting(`collapseType_${el.dataset?.type as EntityType}`);
                }
            });

        this.setPosition({ ...this.position, height: 'auto' });
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
            .replace(/]/g, '||]')
            .replace(/"/g, '\\"');

        element.find<HTMLDetailsElement>('details[data-type]')
            // eslint-disable-next-line no-param-reassign
            .each((_, el) => { el.open = true; });

        element.find('[data-filter-text]').hide();
        element.find(`[data-filter-text*="${this.#currentFilter}"]`).show();
        this.setPosition({ ...this.position, height: 'auto' });
    }

    protected async loadEntities(): Promise<void> {
        const entities = await api.getAllEntities(
            this.campaign.id,
            [
                'ability',
                'character',
                'location',
                'race',
                'organisation',
                'family',
                'item',
                'journal',
                'note',
                'quest',
                'event',
            ],
        );

        this.#entities = entities?.filter((entity) => {
            if (!getSetting('importTemplateEntities') && entity.is_template) {
                return false;
            }

            if (!getSetting('importPrivateEntities') && entity.is_private) {
                return false;
            }

            return true;
        });

        this.render();
    }

    // eslint-disable-next-line
    protected async _render(force?: boolean, options?: any): Promise<void> {
        if (!this.#entities) {
            this.#entities = undefined;
            requestAnimationFrame(async () => {
                try {
                    await this.loadEntities();
                } catch (error) {
                    showError('browser.error.loadEntity');
                    logError(error);
                    await this.close();
                }
            });
        }

        await super._render(force, options);
    }

    protected setLoadingState(button: HTMLButtonElement, determined = false): ProgressFn {
        const $button = $(button);
        $button.addClass('-loading');
        $(this.element).find('[data-action]').prop('disabled', true);

        if (determined) $button.addClass('-determined');
        else $button.addClass('-undetermined');

        return (current, max) => {
            $button.addClass('-determined');
            button.style.setProperty('--progress', `${Math.round((current / max) * 100)}%`);
        };
    }
}

if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
        if (newModule) {
            const KankaBrowserApplication = newModule.default;
            const browserApplication = new KankaBrowserApplication();
            browserApplication.render(true);
            browserApplication.setPosition(import.meta.hot?.data.position);
        }
    });

    import.meta.hot.dispose(() => {
        const app = Object
            .values(ui.windows)
            .find(a => a.constructor === KankaBrowserApplication);

        if (app) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            import.meta.hot!.data.position = app.position;
            app.close();
        }
    });
}

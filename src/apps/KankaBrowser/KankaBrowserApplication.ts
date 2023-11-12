import api from '../../api';
import getMessage from '../../foundry/getMessage';
import { findAllKankaEntries, findEntryByEntityId, getEntryFlag, hasOutdatedEntryByEntity } from '../../foundry/journalEntries';
import { showError } from '../../foundry/notifications';
import { KankaSettings, getSetting, setSetting } from '../../foundry/settings';
import { createEntities, createEntity, updateEntity } from '../../syncEntities';
import EntityType from '../../types/EntityType';
import { KankaApiCampaign, KankaApiChildEntity, KankaApiEntity, KankaApiEntityType } from '../../types/kanka';
import { ProgressFn } from '../../types/progress';
import groupBy from '../../util/groupBy';
import { logError, logInfo } from '../../util/logger';
import template from './KankaBrowserApplication.hbs';
import './KankaBrowserApplication.scss';

interface EntityTypeConfig {
    icon: string;
    isOpen: boolean;
}

interface TemplateData {
    campaigns?: Record<string, string>[];
    campaign?: KankaApiCampaign;
    data?: KankaApiEntity[];
    typeConfig: Record<string, EntityTypeConfig>,
    currentFilter: string;
    deletedEntries: KankaApiChildEntity[];
    settings: {
        showPrivate: boolean;
        view: KankaSettings['browserView'];
    },
}

type TypeMetaData = {
    count: number,
    countLinked: number,
    entities: KankaApiEntity[]
};

const entityTypes: Partial<Record<EntityType, { icon: string }>> = {
    [EntityType.ability]: {
        icon: 'fa-fire',
    },
    [EntityType.character]: {
        icon: 'fa-user',
    },
    [EntityType.creature]: {
        icon: 'fa-deer',
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
    #campaign: KankaApiCampaign | undefined;
    #campaigns: KankaApiCampaign[] | undefined;
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

    protected get deletedSnapshots(): KankaApiChildEntity[] {
        return findAllKankaEntries()
            .flatMap((entry) => {
                const campaignId = getEntryFlag(entry, 'campaign');
                const snapshot = getEntryFlag(entry, 'snapshot');

                if (!snapshot) return [];
                if (!this.#entities) return [];
                if (campaignId !== this.#campaign?.id) return [];
                if (this.#entities.some(e => e.id === snapshot.entity_id)) return [];

                return [snapshot];
            });
    }

    public getData(): TemplateData {
        const typeConfig: Record<string, { icon: string, isOpen: boolean }> = {};

        Object
            .entries(entityTypes)
            .forEach(([type, cfg]) => {
                typeConfig[type] = {
                    ...cfg,
                    isOpen: true,
                };
            });

        const groupedEntities = groupBy(this.#entities ?? [], 'type');
        const groupedEntitiesWithMetaData: Record<string, TypeMetaData> = {};

        Array
            .from(groupedEntities.entries())
            .sort(([a], [b]) => a[0].localeCompare(b[0]))
            .forEach(([type, entities]) => {
                groupedEntitiesWithMetaData[type] = {
                    entities,
                    count: entities.length,
                    countLinked: entities.filter(e => !!findEntryByEntityId(e.id)).length,
                };
            });

        return {
            ...super.getData(),
            campaign: this.#campaign ?? { id: 0 },
            // eslint-disable-next-line @typescript-eslint/naming-convention
            campaigns: (this.#campaigns ?? []).reduce((choices, { id, name }) => ({ ...choices, [String(id)]: name }), { 0: '-- Please choose --' }),
            currentFilter: this.#currentFilter,
            typeConfig,
            entities: groupedEntitiesWithMetaData,
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

        html.on('input', '[name="campaigns"]', async (event) => {
            const campaignId = event.target.value === '0' ? '' : event.target.value;
            await setSetting('campaign', campaignId);
            this.#campaign = undefined;
            this.#entities = undefined;
            this.render();
        });

        html.on('click', 'button[data-action]', async (event) => {
            if (!this.#campaign) return;

            const { action, id: idString, type } = event.currentTarget?.dataset ?? {};
            const id = parseInt(idString, 10);

            logInfo('click', { action, id, type }, this.#campaign);

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

                    case 'open-in-kanka': {
                        if (!this.#campaign) return;

                        let url = this.#campaign.urls.view;
                        if (id) {
                            const entity = this.#entities?.find(e => e.id === id);
                            url = entity?.urls.view ?? '';
                        } else if (type) {
                            url = `${url}/${type.replace(/y$/, 'ie')}s`;
                        }

                        if (url) {
                            window.open(url, '_blank');
                        } else {
                            logError('Could not find a matching Kanka URL', { type, url });
                        }

                        break;
                    }

                    case 'update-single': {
                        const entry = findEntryByEntityId(id);
                        this.setLoadingState(event.currentTarget);
                        if (entry) {
                            await updateEntity(entry, this.#entities);
                        } else {
                            const entity = this.#entities?.find(e => e.id === id);
                            if (entity) {
                                await createEntity(this.#campaign.id, entity?.type, entity?.child_id, this.#entities);
                            }
                        }
                        this.render();
                        break;
                    }

                    case 'link-type': {
                        if (!type) return;
                        const unlinkedEntities = this.#entities?.filter((entity) => {
                            if (entity.type !== type) return false;
                            return !findEntryByEntityId(entity.id);
                        }) ?? [];

                        this.setLoadingState(event.currentTarget);
                        await createEntities(
                            this.#campaign.id,
                            type,
                            unlinkedEntities.map(e => e.child_id),
                            this.#entities,
                        );
                        this.render();
                        break;
                    }

                    case 'link-all': {
                        const unlinkedEntities = this.#entities
                            ?.filter(entity => !findEntryByEntityId(entity.id)) ?? [];

                        this.setLoadingState(event.currentTarget);
                        const entityMap = groupBy(unlinkedEntities, 'type');

                        // eslint-disable-next-line no-restricted-syntax
                        for (const syncType in entityMap) {
                            if (Object.prototype.hasOwnProperty.call(entityMap, syncType)) {
                                // eslint-disable-next-line no-await-in-loop
                                await createEntities(
                                    this.#campaign.id,
                                    syncType as KankaApiEntityType,
                                    entityMap[syncType].map(e => e.child_id),
                                    this.#entities,
                                );
                            }
                        }

                        this.render();
                        break;
                    }

                    case 'update-outdated': {
                        const outdatedEntries = this.#entities
                            ?.filter((entity) => {
                                if (!hasOutdatedEntryByEntity(entity)) {
                                    return false;
                                }

                                return !type || entity.type === type;
                            })
                            .map(entity => findEntryByEntityId(entity.id))
                            .filter((entry): entry is JournalEntry => !!entry) ?? [];

                        this.setLoadingState(event.currentTarget);

                        await Promise.all(outdatedEntries.map(entry => updateEntity(entry, this.#entities)));

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
        if (!this.#campaign) return;

        const entities = await api.getAllEntities(
            this.#campaign.id,
            [
                'ability',
                'character',
                'creature',
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
        if (!this.#campaign && getSetting('campaign')) {
            try {
                const campaignId = parseInt(getSetting('campaign'), 10);
                this.#campaign = await api.getCampaign(campaignId);
            } catch (error) {
                showError('browser.error.loadEntity');
                logError(error);
                await this.close();
                return;
            }
        }

        if (!this.#campaigns) {
            this.#campaigns = undefined;
            requestAnimationFrame(async () => {
                try {
                    this.#campaigns = await api.getAllCampaigns();
                    this.render();
                } catch (error) {
                    showError('browser.error.loadEntity');
                    logError(error);
                    await this.close();
                }
            });
        }

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

    public async close(options?: any) {
        await super.close(options);
        this.#entities = undefined;
        this.#campaigns = undefined;
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .find((a: any): a is KankaBrowserApplication => a.constructor === KankaBrowserApplication);

        if (app) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            import.meta.hot!.data.position = app.position;
            app.close();
        }
    });
}

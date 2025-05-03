import api from '../../api';
import { findEntryByEntityId, hasOutdatedEntryByEntity } from '../../foundry/journalEntries';
import type { KankaSettings } from '../../foundry/settings';
import EntityType from '../../types/EntityType';
import type { KankaApiCampaign, KankaApiEntity } from '../../types/kanka';
import loadingTemplate from './templates/loading.hbs';
import searchTemplate from './templates/search.hbs';
import campaignTemplate from './templates/campaign.hbs';
import entitiesTemplate from './templates/entities.hbs';
import entityListPartial from './templates/partials/entity-list.hbs';
import entityGridPartial from './templates/partials/entity-grid.hbs';
import { logError } from '../../util/logger';
import { createEntities, createEntity, updateEntity } from '../../syncEntities';
import { showError } from '../../foundry/notifications';
import groupBy from '../../util/groupBy';
import ApplicationV2 = foundry.applications.api.ApplicationV2;
import HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;
import type { DeepPartial } from 'fvtt-types/utils';

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

type RenderContext = ApplicationV2.RenderContext & Partial<{
    isLoading: boolean,
    allCampaigns: Record<string, string>,
    campaign: KankaApiCampaign | null,
    entities: KankaApiEntity[] | null,
    showPrivate: KankaSettings['importPrivateEntities'],
    view: KankaSettings['browserView'],
    listPartial: string,
    gridPartial: string,
    type: string,
    icon: string,
    isOpen: boolean,
    count: number,
    countLinked: number,
}>;

export default class KankaBrowserApplication extends HandlebarsApplicationMixin(ApplicationV2<RenderContext>) {
    #search = '';
    #entities: KankaApiEntity[] | null = null;
    #allCampaigns: KankaApiCampaign[] | null = null;
    #campaign: KankaApiCampaign | null = null;
    #hooks: Record<string, number> = {};
    #isLoading = false;

    static DEFAULT_OPTIONS: DeepPartial<ApplicationV2.Configuration> = {
        id: 'kanka-browser',
        classes: ['kanka-browser'],
        window: {
            title: 'KANKA.browser.title',
            resizable: true,
            contentClasses: ['knk:overflow-auto', 'knk:m-0'],
            controls: [
                {
                    icon: 'fa-solid fa-list',
                    label: 'KANKA.browser.action.viewList',
                    action: 'viewList',
                },
                {
                    icon: 'fa-solid fa-th-large',
                    label: 'KANKA.browser.action.viewGrid',
                    action: 'viewGrid',
                },
                {
                    icon: 'fa-solid fa-rotate-right',
                    label: 'KANKA.browser.action.reload',
                    action: 'reload',
                },
            ],
        },
        position: {
            height: 'auto',
            width: 720,
        },
        actions: {
            reload: KankaBrowserApplication.reload,
            viewGrid: KankaBrowserApplication.viewGrid,
            viewList: KankaBrowserApplication.viewList,
            openInKanka: KankaBrowserApplication.openInKanka,
            openInFoundry: KankaBrowserApplication.openInFoundry,
            updateSingle: KankaBrowserApplication.updateSingle,
            linkAll: KankaBrowserApplication.linkAll,
            updateOutdated: KankaBrowserApplication.updateOutdated,
        },
    };

    static PARTS: Record<string, HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
        loading: {
            template: loadingTemplate,
        },
        campaign: {
            template: campaignTemplate,
        },
        search: {
            template: searchTemplate,
        },
        ...Object.keys(entityTypes).reduce((acc, type) => {
            acc[type] = {
                template: entitiesTemplate,
                templates: [entitiesTemplate, entityListPartial, entityGridPartial],
            };
            return acc;
        }, {}),
    };

    static async reload(this: KankaBrowserApplication) {
        this.setupData();
        this.render();
    }

    static async viewGrid(this: KankaBrowserApplication) {
        await game.settings?.set('kanka-foundry', 'browserView', 'grid');
        this.render({ parts: Object.keys(entityTypes) });
    }

    static async viewList(this: KankaBrowserApplication) {
        await game.settings?.set('kanka-foundry', 'browserView', 'list');
        this.render({ parts: Object.keys(entityTypes) });
    }

    static async openInKanka(this: KankaBrowserApplication, event: PointerEvent, target: HTMLElement) {
        try {
            if (!this.#campaign) return;

            const type = target.closest<HTMLElement>('[data-application-part]')?.dataset.applicationPart;
            const rawId = target.closest<HTMLElement>('[data-entity-id]')?.dataset.entityId;
            const id = rawId ? Number.parseInt(rawId, 10) : null;
            let url = this.#campaign.urls.view;

            if (id) {
                const entity = this.#entities?.find(e => e.type === type && e.id === id);
                url = entity?.urls.view ?? url;
            } else if (type && type in entityTypes) {
                url = `${url}/${type.replace(/y$/, 'ie')}s`;
            }

            if (url) {
                window.open(url, '_blank');
            } else {
                logError('Could not find a matching Kanka URL', { type, url });
            }
        } catch (error) {
            logError(error);
            showError('browser.error.actionError');
        } finally {
            this.render();
        }
    }

    static async openInFoundry(this: KankaBrowserApplication, event, target) {
        try {
            const rawId = target.closest('[data-entity-id]').dataset.entityId;
            const id = rawId ? Number.parseInt(rawId, 10) : null;

            if (!id) return;

            const sheet = findEntryByEntityId(id)?.sheet;
            sheet?.render(true);
            sheet?.maximize();
        } catch (error) {
            logError(error);
            showError('browser.error.actionError');
        } finally {
            this.render();
        }
    }

    static async updateSingle(this: KankaBrowserApplication, event, target) {
        try {
            if (!this.#campaign || !this.#entities) return;

            const rawId = target.closest('[data-entity-id]').dataset.entityId;
            const id = rawId ? Number.parseInt(rawId, 10) : null;

            if (!id) return;

            this.setLoadingState(target);

            const entry = findEntryByEntityId(id);
            if (entry) {
                await updateEntity(entry, this.#entities);
            } else {
                const entity = this.#entities?.find((e) => e.id === id);
                if (entity) {
                    await createEntity(this.#campaign.id, entity.module.code, entity.child_id, this.#entities);
                }
            }
        } catch (error) {
            logError(error);
            showError('browser.error.actionError');
        } finally {
            this.render();
        }
    }

    static async linkAll(this: KankaBrowserApplication, event, target) {
        try {
            if (!this.#campaign || !this.#entities) return;

            let type = target.closest('[data-application-part]').dataset.applicationPart;
            if (!(type in entityTypes)) type = undefined;

            const unlinkedEntities = this.getEntities(type).filter((entity) => !findEntryByEntityId(entity.id));
            const grouped = groupBy(unlinkedEntities, 'module.code');

            this.setLoadingState(target);

            for (const [syncType, entities] of grouped) {
                try {
                    await createEntities(
                        this.#campaign.id,
                        syncType,
                        entities.map((e) => e.child_id),
                        this.#entities,
                    );
                } catch (error) {
                    console.warn(`Failed to sync entities of type ${syncType}: `, error);
                }
            }
        } catch (error) {
            logError(error);
            showError('browser.error.actionError');
        } finally {
            this.render();
        }
    }

    static async updateOutdated(this: KankaBrowserApplication, event, target) {
        try {
            if (!this.#campaign || !this.#entities) return;

            let type = target.closest('[data-application-part]').dataset.applicationPart;
            if (!(type in entityTypes)) type = undefined;

            const outdatedEntries = this.getEntities(type)
                .filter((entity) => hasOutdatedEntryByEntity(entity))
                .map((entity) => findEntryByEntityId(entity.id))
                .filter((entry): entry is JournalEntry => !!entry);

            this.setLoadingState(target);
            await Promise.all(outdatedEntries.map((entry) => updateEntity(entry, this.#entities ?? [])));
        } catch (error) {
            logError(error);
            showError('browser.error.actionError');
        } finally {
            this.render();
        }
    }

    protected getEntities(type?: EntityType) {
        if (!this.#entities) return [];

        return this.#entities
            .filter(e => e.name.toLowerCase().includes(this.#search.toLowerCase()) && (!type || e.module.code === type))
            .map(entity => {
                const isOutdated = hasOutdatedEntryByEntity(entity);
                return {
                    ...entity,
                    state: {
                        isOutdated,
                        isPrivate: entity.is_private && !isOutdated,
                        isLinked: Boolean(findEntryByEntityId(entity.id))
                    },
                };
            }).toSorted((a, b) => a.name.localeCompare(b.name));
    }

    protected setLoadingState(button: HTMLButtonElement): void {
        button.classList.add('-knk:loading-indicator');
        for (const el of this.element.querySelectorAll('[data-action]')) {
            el.setAttribute('disabled', 'true');
        }
    }

    protected async loadEntities(campaignId: number): Promise<KankaApiEntity[]> {
        const entities = await api.getAllEntities(campaignId, [
            'ability',
            'calendar',
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
        ]);

        return entities?.filter(entity => {
            if (!game.settings?.get('kanka-foundry', 'importTemplateEntities') && entity.is_template) {
                return false;
            }

            if (!game.settings?.get('kanka-foundry', 'importPrivateEntities') && entity.is_private) {
                return false;
            }

            return true;
        });
    }

    protected async loadDataForCampaign(campaignId?: number) {
        if (!campaignId) return { campaign: null, entities: null };

        const [campaign, entities] = await Promise.all([
            api.getCampaign(campaignId),
            this.loadEntities(campaignId),
        ]);

        return { campaign, entities };
    }

    protected setupData(this: KankaBrowserApplication): void {
        if (this.#isLoading) return;

        const rawId = game.settings?.get('kanka-foundry', 'campaign');
        const campaignId = rawId ? Number.parseInt(rawId, 10) : undefined;

        this.#allCampaigns = null;
        this.#campaign = null;
        this.#entities = null;
        this.#isLoading = true;

        Promise.all([api.getAllCampaigns(), this.loadDataForCampaign(campaignId)]).then(([allCampaigns, { campaign, entities }]) => {
            this.#allCampaigns = allCampaigns;
            this.#campaign = campaign;
            this.#entities = entities;
            this.#isLoading = false;
            this.render({ force: true });
        }).catch(error => {
            logError(error);
            showError('browser.error.loadEntity');
            this.close();
        });
    }

    async _preFirstRender(this: KankaBrowserApplication, context, options): Promise<void> {
        this.#hooks.deleteJournalEntry = Hooks.on('deleteJournalEntry', (entry: JournalEntry) => this.render());
        await super._preFirstRender(context, options);
        this.setupData();
    }

    async _preClose() {
        for (const [hook, id] of Object.entries(this.#hooks)) {
            Hooks.off(hook, id);
        }
    }

    async _prepareContext() {
        return {
            isLoading: this.#isLoading,
            allCampaigns: (this.#allCampaigns ?? []).reduce((choices, { id, name }) => { choices[String(id)] = name; return choices; }, {
                0: '-- Please choose --',
            }),
            campaign: this.#campaign,
            entities: [],
            showPrivate: game.settings?.get('kanka-foundry', 'importPrivateEntities'),
            view: game.settings?.get('kanka-foundry', 'browserView'),
            listPartial: entityListPartial,
            gridPartial: entityGridPartial,
        };
    }

    async _preparePartContext(partId, context) {
        if (partId in entityTypes) {
            const entities = this.getEntities(partId as EntityType);

            return {
                ...context,
                type: partId,
                icon: entityTypes[partId]?.icon,
                isOpen: !!this.#search || game.settings?.get('kanka-foundry', `collapseType_${partId as EntityType}`),
                entities: entities,
                count: entities.length,
                countLinked: entities.filter(e => !!findEntryByEntityId(e.id)).length,
            }
        }

        return context;
    }

    async _onRender() {
        this.element.querySelector('#knk-entity-search')?.addEventListener(
            'input',
            foundry.utils.debounce((event: Event) => {
                const target = event.currentTarget as HTMLInputElement | null;
                if (!target) return;

                this.#search = target.value;
                this.render({ parts: Object.keys(entityTypes) });
            }, 300),
        );

        this.element.querySelector<HTMLSelectElement>('#knk-campaign-select')?.addEventListener(
            'change',
            async (event) => {
                const target = event.currentTarget as HTMLSelectElement | null;
                if (!target) return;

                const campaignId = target.value === '0' ? '' : target.value;
                await game.settings?.set('kanka-foundry', 'campaign', campaignId);
                this.setupData();
                this.render();
            },
        );

        for (const details of this.element.querySelectorAll<HTMLDetailsElement>('details[data-application-part]')) {
            details.addEventListener('toggle', async event => {
                const target = event.currentTarget as HTMLDetailsElement | null;
                if (!target) return;

                const type = target.dataset.applicationPart as EntityType;
                if (!(type in entityTypes) || this.#search) return;
                await game.settings?.set('kanka-foundry', `collapseType_${type}`, target.open);
            });
        }
    }
}

if (import.meta.hot) {
    import.meta.hot.accept(newModule => {
        if (newModule) {
            const KankaBrowserApplication = newModule.default;
            const browserApplication = new KankaBrowserApplication();
            browserApplication.render({ force: true });
        }
    });

    import.meta.hot.dispose(() => {
        if ((ui as any).activeWindow instanceof KankaBrowserApplication) {
            if (import.meta.hot) import.meta.hot.data.position = (ui as any).activeWindow.position;
            (ui as any).activeWindow.close();
        }
    });
}

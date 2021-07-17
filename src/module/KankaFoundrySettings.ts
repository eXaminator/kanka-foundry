import type KankaFoundry from '../KankaFoundry';
import { logInfo } from '../logger';
import moduleConfig from '../module.json';
import EntityType from '../types/EntityType';
import {
    kankaBrowserTypeCollapseSetting,
    KankaSettings,
} from '../types/KankaSettings';

type KankaBrowserViews = 'list' | 'grid';

export default class KankaFoundrySettings {
    #module: KankaFoundry;

    constructor(module: KankaFoundry) {
        this.#module = module;
    }

    public async initialize(): Promise<void> {
        this.register(
            KankaSettings.accessToken,
            {
                name: this.#module.getMessage('settings.token.label'),
                hint: this.#module.getMessage('settings.token.hint'),
                scope: 'world',
                config: true,
                type: String,
                default: '',
                onChange: async (value) => {
                    await this.#module.setToken(String(value));
                },
            },
        );

        this.register(
            KankaSettings.campaign,
            {
                name: this.#module.getMessage('settings.campaign.label'),
                hint: this.#module.getMessage('settings.campaign.hint'),
                scope: 'world',
                config: true,
                type: String,
                default: '',
                choices: {
                    '': '',
                },
                onChange: async (value) => {
                    await this.#module.loadCurrentCampaignById(parseInt(String(value), 10) || null);
                },
            },
        );

        this.register(
            KankaSettings.importLanguage,
            {
                name: this.#module.getMessage('settings.locale.label'),
                hint: this.#module.getMessage('settings.locale.hint'),
                scope: 'world',
                config: true,
                type: String,
                default: '',
                choices: {
                    '': this.#module.getMessage('settings.locale.default'),
                    ...this.#module.languages,
                },
                onChange: async (value) => {
                    await this.#module.setLanguage(String(value));
                },
            },
        );

        this.register(
            KankaSettings.keepTreeStructure,
            {
                name: this.#module.getMessage('settings.treeStructure.label'),
                hint: this.#module.getMessage('settings.treeStructure.hint'),
                scope: 'world',
                config: true,
                type: Boolean,
                default: true,
            },
        );

        this.register(
            KankaSettings.imageInText,
            {
                name: this.#module.getMessage('settings.imageInText.label'),
                hint: this.#module.getMessage('settings.imageInText.hint'),
                scope: 'world',
                config: true,
                type: Boolean,
                default: true,
            },
        );

        this.register(
            KankaSettings.importPrivateEntities,
            {
                name: this.#module.getMessage('settings.importPrivate.label'),
                hint: this.#module.getMessage('settings.importPrivate.hint'),
                scope: 'world',
                config: true,
                type: Boolean,
                default: true,
            },
        );

        this.register(
            KankaSettings.importTemplateEntities,
            {
                name: this.#module.getMessage('settings.importTemplate.label'),
                hint: this.#module.getMessage('settings.importTemplate.hint'),
                scope: 'world',
                config: true,
                type: Boolean,
                default: false,
            },
        );

        this.register(
            KankaSettings.disableExternalMentionLinks,
            {
                name: this.#module.getMessage('settings.disableExternalLinks.label'),
                hint: this.#module.getMessage('settings.disableExternalLinks.hint'),
                scope: 'world',
                config: true,
                type: Boolean,
                default: false,
            },
        );

        this.register(
            KankaSettings.automaticPermissions,
            {
                name: this.#module.getMessage('settings.automaticPermissions.label'),
                hint: this.#module.getMessage('settings.automaticPermissions.hint'),
                scope: 'world',
                config: true,
                type: Boolean,
                default: false,
            },
        );

        this.#module.game.settings.register(
            moduleConfig.name,
            KankaSettings.browserView,
            {
                scope: 'client',
                config: false,
                type: String,
                default: 'list',
            },
        );

        Object
            .values(EntityType)
            .filter(type => type !== EntityType.campaign)
            .forEach((type: EntityType) => {
                this.#module.game.settings.register(
                    moduleConfig.name,
                    kankaBrowserTypeCollapseSetting(type),
                    {
                        scope: 'client',
                        config: false,
                        type: Boolean,
                        default: false,
                    },
                );
            });
    }

    public async dispose(): Promise<void> {
        Array
            .from<string>(this.#module.game.settings.settings.keys())
            .filter((key: string) => key.startsWith(moduleConfig.name))
            .forEach(key => this.#module.game.settings.settings.delete(key));
    }

    private register(
        setting: KankaSettings,
        data: ClientSettings.PartialSetting,
    ): void {
        this.#module.game.settings.register(this.#module.name, setting, data);
    }

    public get token(): string {
        return this.getSetting<string>(KankaSettings.accessToken);
    }

    public get currentCampaignId(): number | null {
        return parseInt(this.getSetting<string>(KankaSettings.campaign), 10) || null;
    }

    public get importLanguage(): string {
        return this.getSetting<string>(KankaSettings.importLanguage);
    }

    public get browserView(): KankaBrowserViews {
        return this.getSetting<KankaBrowserViews>(KankaSettings.browserView);
    }

    public setBrowserView(view: KankaBrowserViews): Promise<void> {
        return this.setSetting<KankaBrowserViews>(KankaSettings.browserView, view);
    }

    public get importPrivateEntities(): boolean {
        return this.getSetting<boolean>(KankaSettings.importPrivateEntities);
    }

    public get importTemplateEntities(): boolean {
        return this.getSetting<boolean>(KankaSettings.importTemplateEntities);
    }

    public get imageInText(): boolean {
        return this.getSetting<boolean>(KankaSettings.imageInText);
    }

    public get disableExternalLinks(): boolean {
        return this.getSetting<boolean>(KankaSettings.disableExternalMentionLinks);
    }

    public get keepTreeStructure(): boolean {
        return this.getSetting<boolean>(KankaSettings.keepTreeStructure);
    }

    public get automaticPermissions(): boolean {
        return this.getSetting<boolean>(KankaSettings.automaticPermissions);
    }

    public isTypeCollapsed(type: EntityType): boolean {
        return this.getSetting<boolean>(kankaBrowserTypeCollapseSetting(type));
    }

    public setIsTypeCollapsed(type: EntityType, isCollapsed: boolean): Promise<void> {
        return this.setSetting<boolean>(kankaBrowserTypeCollapseSetting(type), isCollapsed);
    }

    private getSetting<T = unknown>(setting: KankaSettings): T {
        logInfo('getSettings', setting);
        return this.#module.game.settings.get(this.#module.name, setting) as T;
    }

    private async setSetting<T = unknown>(setting: KankaSettings, value: T): Promise<void> {
        logInfo('setSettings', setting, value);
        await this.#module.game.settings.set(this.#module.name, setting, value);
    }
}

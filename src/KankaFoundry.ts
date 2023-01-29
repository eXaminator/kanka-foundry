import moduleConfig from '../public/module.json';
import registerSheet from './KankaJournal/KankaJournalApplication';
import { logError, logInfo } from './logger';
import api from './module/api';
import KankaJournalHelper from './module/KankaJournalHelper';
import { showError } from './module/notifications';
import { getSetting } from './module/settings';
import { KankaApiCampaign } from './types/kanka';

export default class KankaFoundry {
    public readonly currentVersion = 1;

    #name = moduleConfig.name;
    #module?: Game.ModuleData<unknown>;
    #currentCampaign?: KankaApiCampaign;
    #renderLocalization = new Localization('en');
    #journalHelper = new KankaJournalHelper(this);
    #isInitialized = false;

    get game(): Game {
        if (!(game instanceof Game)) throw new Error('Game is not initialized yet.');
        return game;
    }

    public async initialize(): Promise<void> {
        logInfo('Initializing');

        this.#module = this.game.modules.get(this.#name);

        registerSheet(this);

        try {
            await this.loadCurrentCampaignById(parseInt(getSetting('campaign'), 10));

            await this.#renderLocalization.initialize();
            await this.#renderLocalization.setLanguage(
                getSetting('importLanguage') || this.game.i18n.lang,
            );

            this.#isInitialized = true;
        } catch (error) {
            logError(error);

            // Special case, because notifications and translations might not be ready yet.
            const interval = setInterval(() => {
                if (
                    ui?.notifications
                    && (this.game.i18n.translations as Record<string, unknown>)?.KANKA
                ) {
                    showError('general.initializationError');
                    clearInterval(interval);
                }
            }, 100);
        }

        logInfo('Done initializing!');
    }

    public async dispose(): Promise<void> {
        this.#isInitialized = false;
    }

    public get isInitialized(): boolean {
        return this.#isInitialized;
    }

    public get name(): string {
        return this.#name;
    }

    public get baseUrl(): string {
        return api.baseUrl;
    }

    public get languages(): Record<string, string> {
        return (
            this.#module?.languages.reduce(
                (map, { lang, name }) => ({ ...map, [lang]: name }),
                {},
            ) ?? {}
        );
    }

    public get localization(): Localization {
        return this.#renderLocalization;
    }

    public setLanguage(language: string): Promise<void> {
        return this.#renderLocalization.setLanguage(language || this.game.i18n.lang);
    }

    public get journals(): KankaJournalHelper {
        return this.#journalHelper;
    }

    public get currentCampaign(): KankaApiCampaign | undefined {
        return this.#currentCampaign;
    }

    public async loadCurrentCampaignById(id: number | null): Promise<void> {
        if (!api.isReady) {
            return;
        }

        if (id) {
            this.#currentCampaign = await api.getCampaign(id);
        } else {
            this.#currentCampaign = undefined;
        }
    }
}

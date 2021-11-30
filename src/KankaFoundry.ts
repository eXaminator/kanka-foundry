import AccessToken from './api/AccessToken';
import KankaApi from './api/KankaApi';
import registerSheet from './KankaJournal/KankaJournalApplication';
import { logError, logInfo } from './logger';
import migrateV1 from './migrations/migrateV1';
import migrateV2 from './migrations/migrateV2';
import migrateV3 from './migrations/migrateV3';
import moduleConfig from './module.json';
import KankaFoundrySettings from './module/KankaFoundrySettings';
import KankaJournalHelper from './module/KankaJournalHelper';
import { KankaApiCampaign } from './types/kanka';

export default class KankaFoundry {
    public readonly currentVersion = 1;

    #name = moduleConfig.name;
    #module?: Game.ModuleData<unknown>;
    #settings = new KankaFoundrySettings(this);
    #api = new KankaApi();
    #currentCampaign?: KankaApiCampaign;
    #debugElement = $('<span class="kanka-limit-debug">0 / 0 (0)</span>');
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

        // Debug output to show current rate limiting
        if (process.env.NODE_ENV === 'development') {
            $('body').append(this.#debugElement);
            this.#api.limiter.onChange((event) => {
                this.#debugElement.text(`${event.usedSlots} / ${event.maxSlots} (${event.queue})`);
            });
        }

        try {
            await this.#settings.initialize();
            await this.setToken(this.#settings.token);
            await this.loadCurrentCampaignById(this.#settings.currentCampaignId);

            await this.#renderLocalization.initialize();
            await this.#renderLocalization.setLanguage(this.settings.importLanguage || this.game.i18n.lang);
            migrateV1(this);
            await migrateV2(this);
            await migrateV3(this);

            this.#isInitialized = true;
        } catch (error) {
            logError(error);

            // Special case, because notifications and translations might not be ready yet.
            const interval = setInterval(() => {
                if (ui?.notifications && (this.game.i18n.translations as Record<string, unknown>)?.KANKA) {
                    this.showError('general.initializationError');
                    clearInterval(interval);
                }
            }, 100);
        }

        logInfo('Done initializing!');
    }

    public async dispose(): Promise<void> {
        this.#debugElement.remove();
        await this.#settings.dispose();
        this.#isInitialized = false;
    }

    public async setToken(token: string): Promise<void> {
        if (!token) {
            this.#api.reset();
            return;
        }

        try {
            const accessToken = new AccessToken(token);

            if (accessToken.isExpired()) {
                this.#api.reset();
                this.showError('settings.error.ErrorTokenExpired');
                return;
            }

            if (accessToken.isExpiredWithin(7 * 24 * 60 * 60)) { // One week
                this.showError('settings.error.WarningTokenExpiration');
            }

            this.#api.switchUser(accessToken);
        } catch (error) {
            logError('Error setting a token', error);
            this.showError('settings.error.ErrorInvalidAccessToken');
        }
    }

    public get isInitialized(): boolean {
        return this.#isInitialized;
    }

    public get name(): string {
        return this.#name;
    }

    public get languages(): Record<string, string> {
        return this.#module?.languages
            .reduce((map, { lang, name }) => ({ ...map, [lang]: name }), {}) ?? {};
    }

    public get localization(): Localization {
        return this.#renderLocalization;
    }

    public setLanguage(language: string): Promise<void> {
        return this.#renderLocalization.setLanguage(language || this.game.i18n.lang);
    }

    public get settings(): KankaFoundrySettings {
        return this.#settings;
    }

    public get journals(): KankaJournalHelper {
        return this.#journalHelper;
    }

    public get api(): KankaApi {
        return this.#api;
    }

    public get currentCampaign(): KankaApiCampaign | undefined {
        return this.#currentCampaign;
    }

    public getMessage(...args: [...string[], Record<string, unknown>] | string[]): string {
        const values = args.slice(-1)[0];
        const keys = args.slice(0, -1);

        if (!values || typeof values === 'string') {
            return this.game.i18n.localize(`KANKA.${[...keys, values].join('.')}`);
        }

        return this.game.i18n.format(`KANKA.${keys.join('.')}`, values);
    }

    public showInfo(...args: [...string[], Record<string, unknown>] | string[]): void {
        ui.notifications?.info(this.getMessage(...args));
    }

    public showWarning(...args: [...string[], Record<string, unknown>] | string[]): void {
        ui.notifications?.warn(this.getMessage(...args));
    }

    public showError(...args: [...string[], Record<string, unknown>] | string[]): void {
        ui.notifications?.error(this.getMessage(...args), { permanent: true });
    }

    public async loadCurrentCampaignById(id: number | null): Promise<void> {
        if (!this.#api.isReady) {
            return;
        }

        if (id) {
            this.#currentCampaign = await this.#api.getCampaign(id);
        } else {
            this.#currentCampaign = undefined;
        }
    }
}

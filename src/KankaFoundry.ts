import AccessToken from './api/AccessToken';
import KankaApi from './api/KankaApi';
import { logError, logInfo } from './logger';
import migrateV1 from './migrations/migrateV1';
import moduleConfig from './module.json';
import KankaFoundrySettings from './module/KankaFoundrySettings';
import KankaJournalHelper from './module/KankaJournalHelper';
import { KankaApiCampaign } from './types/kanka';

export default class KankaFoundry {
    public readonly currentVersion = 1;

    #name = moduleConfig.name;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    #module?: Record<string, any>;
    #settings = new KankaFoundrySettings(this);
    #api = new KankaApi();
    #currentCampaign?: KankaApiCampaign;
    #debugElement = $('<span class="kanka-limit-debug">0 / 0 (0)</span>');
    #renderLocalization = new Localization();
    #journalHelper = new KankaJournalHelper(this);

    public async initialize(): Promise<void> {
        logInfo('Initializing');

        this.#module = game.modules.get(this.#name);

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
            await this.#renderLocalization.setLanguage(this.settings.importLanguage || game.i18n.lang);
            migrateV1(this);
        } catch (error) {
            logError(error);
            this.showError('settings.error.fetchError');
        }

        logInfo('Done initializing!');
    }

    public async dispose(): Promise<void> {
        this.#debugElement.remove();
        await this.#settings.dispose();
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
        return this.#renderLocalization.setLanguage(language || game.i18n.lang);
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

    public getMessage(...key: string[]): string {
        return game.i18n.localize(`KANKA.${key.join('.')}`);
    }

    public formatMessage(key: string, values: Record<string, unknown>): string {
        return game.i18n.format(`KANKA.${key}`, values);
    }

    public showInfo(...key: string[]): void {
        ui.notifications?.info(this.getMessage(...key));
    }

    public showWarning(...key: string[]): void {
        ui.notifications?.warn(this.getMessage(...key));
    }

    public showError(...key: string[]): void {
        ui.notifications?.error(this.getMessage(...key));
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

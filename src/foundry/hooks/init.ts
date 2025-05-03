import moduleConfig from '../../../public/module.json';
import api from '../../api';
import AccessToken from '../../api/AccessToken';
import DefaultPageSheet from '../../apps/KankaJournal/DefaultPageSheet';
import KankaJournalApplication from '../../apps/KankaJournal/KankaJournalApplication';
import PostPageSheet from '../../apps/KankaJournal/PostPageSheet';
import { KankaPageModel } from '../../apps/KankaJournal/models/KankaPageModel';
import registerHandlebarsHelpers from '../../handlebars/registerHandlebarsHelper';
import { logError } from '../../util/logger';
import { showError, showWarning } from '../notifications';
import { registerSettings } from '../settings';

function setToken(token: string): void {
    if (!token) {
        api.reset();
        return;
    }

    try {
        const accessToken = new AccessToken(token);

        if (accessToken.isExpired()) {
            api.reset();
            showError('settings.error.ErrorTokenExpired');
            return;
        }

        // Token is less than a week from expiration
        if (accessToken.isExpiredWithin(7 * 24 * 60 * 60)) {
            showWarning('settings.error.WarningTokenExpiration');
        }

        api.switchUser(accessToken);
    } catch (error) {
        logError('Error setting a token', error);
        showError('settings.error.ErrorInvalidAccessToken');
    }
}

function renderDebugElement(): void {
    const debugElement = $('<span class="knk:limit-debug">0 / 0 (0)</span>');
    $('body').append(debugElement);
    api.limiter.onChange((event) => {
        debugElement.text(`${event.usedSlots} / ${event.maxSlots} (${event.queue})`);
    });
}

export default function init(): void {
    try {
        const pageTypes = Object.keys(moduleConfig.documentTypes.JournalEntryPage).map(
            (type) => `${moduleConfig.id}.${type}`,
        );
        const dataModelTypes = pageTypes.filter((type) => ![`${moduleConfig.id}.post`].includes(type));
        console.log("FOO", CONFIG.JournalEntryPage.dataModels);

        Object.assign(
            CONFIG.JournalEntryPage.dataModels,
            dataModelTypes.reduce<Record<string, unknown>>(
                (config, type) => { config[type] = KankaPageModel; return config; },
                {},
            ),
        );

        DocumentSheetConfig.registerSheet(JournalEntry, moduleConfig.name, KankaJournalApplication, {
            makeDefault: false,
        });

        DocumentSheetConfig.registerSheet(JournalEntryPage, moduleConfig.name, PostPageSheet, {
            types: [`${moduleConfig.id}.post`],
            makeDefault: false,
        });

        DocumentSheetConfig.registerSheet(JournalEntryPage, moduleConfig.name, DefaultPageSheet as unknown as typeof DocumentSheet, {
            types: pageTypes.filter((type) => ![`${moduleConfig.id}.post`].includes(type)),
            makeDefault: false,
        });

        registerHandlebarsHelpers();
        registerSettings();

        // Debug output to show current rate limiting
        if (import.meta.env.DEV) {
            renderDebugElement();
        }

        api.switchBaseUrl(game.settings?.get('kanka-foundry', 'baseUrl') ?? '');
        setToken(game.settings?.get('kanka-foundry', 'accessToken') ?? '');
    } catch (error) {
        logError(error);
        showError('general.initializationError');
    }
}

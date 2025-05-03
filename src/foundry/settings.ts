import moduleConfig from '../../public/module.json';
import api from '../api';
import AccessToken from '../api/AccessToken';
import KankaJournalApplication from '../apps/KankaJournal/KankaJournalApplication';
import localization from '../state/localization';
import EntityType from '../types/EntityType';
import { logError } from '../util/logger';
import getMessage from './getMessage';
import { showError, showWarning } from './notifications';

export type KankaSettings = StripPrefix<PickWithPrefix<SettingConfig, 'kanka-foundry.'>, 'kanka-foundry.'>;
type SettingKeys = keyof KankaSettings;

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

export function registerSettings(): void {
    const languages = moduleConfig.languages.reduce((map, { lang, name }) => { map[lang] = name; return map; }, {}) ?? {};

    game.settings?.register('kanka-foundry',
        'migrationVersion',
        {
            config: false,
            type: String,
            default: '',
        },
    );

    game.settings?.register('kanka-foundry',
        'baseUrl',
        {
            name: getMessage('settings.baseUrl.label'),
            hint: getMessage('settings.baseUrl.hint'),
            scope: 'world',
            config: true,
            type: String,
            default: 'https://api.kanka.io',
            onChange: (value) => api.switchBaseUrl(value ?? ''),
        },
    );

    game.settings?.register('kanka-foundry',
        'accessToken',
        {
            name: getMessage('settings.token.label'),
            hint: getMessage('settings.token.hint'),
            scope: 'client',
            config: true,
            type: String,
            default: '',
            onChange: (value) => setToken(value),
        },
    );

    game.settings?.register('kanka-foundry',
        'campaign',
        {
            name: getMessage('settings.campaign.label'),
            hint: getMessage('settings.campaign.hint'),
            scope: 'world',
            config: false,
            type: String,
            default: '',
        },
    );

    game.settings?.register('kanka-foundry',
        'importLanguage',
        {
            name: getMessage('settings.locale.label'),
            hint: getMessage('settings.locale.hint'),
            scope: 'world',
            config: true,
            type: String,
            default: '',
            choices: {
                ...languages,
            },
            onChange: async (value) => {
                await localization.setLanguage(value ?? game.i18n?.lang ?? 'en');
                for (const app of Object.values(ui.windows)) {
                    if (!(app instanceof KankaJournalApplication)) continue;
                    app.render();
                }
            }
        },
    );

    game.settings?.register('kanka-foundry',
        'keepTreeStructure',
        {
            name: getMessage('settings.treeStructure.label'),
            hint: getMessage('settings.treeStructure.hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: true,
        },
    );

    game.settings?.register('kanka-foundry',
        'mergeOverviewPages',
        {
            name: getMessage('settings.mergeOverviewPages.label'),
            hint: getMessage('settings.mergeOverviewPages.hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: true,
        },
    );

    game.settings?.register('kanka-foundry',
        'importPrivateEntities',
        {
            name: getMessage('settings.importPrivate.label'),
            hint: getMessage('settings.importPrivate.hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: true,
        },
    );

    game.settings?.register('kanka-foundry',
        'importTemplateEntities',
        {
            name: getMessage('settings.importTemplate.label'),
            hint: getMessage('settings.importTemplate.hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: false,
        },
    );

    game.settings?.register('kanka-foundry',
        'disableExternalMentionLinks',
        {
            name: getMessage('settings.disableExternalLinks.label'),
            hint: getMessage('settings.disableExternalLinks.hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: false,
        },
    );

    game.settings?.register('kanka-foundry',
        'questQuestStatusIcon',
        {
            name: getMessage('settings.questStatusIcon.label'),
            hint: getMessage('settings.questStatusIcon.hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: false,
        },
    );

    game.settings?.register('kanka-foundry',
        'automaticPermissions',
        {
            name: getMessage('settings.automaticPermissions.label'),
            hint: getMessage('settings.automaticPermissions.hint'),
            scope: 'world',
            config: true,
            type: String,
            default: 'never',
            choices: {
                never: getMessage('settings.automaticPermissions.values.never'),
                initial: getMessage('settings.automaticPermissions.values.initial'),
                always: getMessage('settings.automaticPermissions.values.always'),
            },
        },
    );

    game.settings?.register('kanka-foundry',
        'browserView',
        {
            scope: 'client',
            config: false,
            type: String,
            default: 'list',
        },
    );

    for (const type of Object.values(EntityType)) {
        if (type === EntityType.campaign) {
            continue;
        }

        game.settings?.register('kanka-foundry',
            `collapseType_${type}`,
            {
                scope: 'client',
                config: false,
                type: Boolean,
                default: false,
            },

        );
    }
}

if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        for (const key of game.settings?.settings.keys() ?? []) {
            if (!key.startsWith('kanka-foundry')) {
                continue;
            }
            game.settings?.settings.delete(key);
        }
    });
}

import moduleConfig from '../../public/module.json';
import EntityType from '../types/EntityType';
import getGame from './getGame';
import getMessage from './getMessage';

export type KankaSettings = {
    baseUrl: string;
    accessToken: string;
    campaign: string;
    importLanguage: string;
    disableExternalMentionLinks: boolean;
    importPrivateEntities: boolean;
    imageInText: boolean;
    keepTreeStructure: boolean;
    browserView: 'grid' | 'list';
    automaticPermissions: 'never' | 'initial' | 'always';
    importTemplateEntities: boolean;
    questQuestStatusIcon: boolean;
} & Record<`collapseType_${keyof typeof EntityType}`, boolean>;

export function getSetting<T extends keyof KankaSettings>(setting: T): KankaSettings[T] {
    return getGame().settings.get(moduleConfig.name, setting) as KankaSettings[T];
}

export async function setSetting<T extends keyof KankaSettings>(setting: T, value: KankaSettings[T]): Promise<void> {
    await getGame().settings.set(moduleConfig.name, setting, value);
}

type OnChangeMap<K extends keyof KankaSettings = keyof KankaSettings> = {
    [P in K]?: (value?: KankaSettings[P]) => unknown | Promise<unknown>;
};

async function register<T extends keyof KankaSettings>(
    setting: T,
    data: ClientSettings.PartialSettingConfig<KankaSettings[T]>,
    onChangeMap: OnChangeMap,
): Promise<void> {
    getGame().settings.register<string, string, KankaSettings[T]>(moduleConfig.name, setting, {
        ...data,
        onChange: (value) => {
            onChangeMap[setting]?.((data.type?.(value) as KankaSettings[T]) ?? undefined);
        },
    });
}

export function registerSettings(onChangeMap: OnChangeMap): () => Promise<void> {
    const languages = moduleConfig.languages.reduce((map, { lang, name }) => ({ ...map, [lang]: name }), {}) ?? {};

    register(
        'baseUrl',
        {
            name: getMessage('settings.baseUrl.label'),
            hint: getMessage('settings.baseUrl.hint'),
            scope: 'world',
            config: true,
            type: String,
            default: 'https://kanka.io',
        },
        onChangeMap,
    );

    register(
        'accessToken',
        {
            name: getMessage('settings.token.label'),
            hint: getMessage('settings.token.hint'),
            scope: 'client',
            config: true,
            type: String,
            default: '',
        },
        onChangeMap,
    );

    register(
        'campaign',
        {
            name: getMessage('settings.campaign.label'),
            hint: getMessage('settings.campaign.hint'),
            scope: 'world',
            config: true,
            type: String,
            default: '',
            choices: {
                '': '', // eslint-disable-line @typescript-eslint/naming-convention
            },
        },
        onChangeMap,
    );

    register(
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
        },
        onChangeMap,
    );

    register(
        'keepTreeStructure',
        {
            name: getMessage('settings.treeStructure.label'),
            hint: getMessage('settings.treeStructure.hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: true,
        },
        onChangeMap,
    );

    register(
        'imageInText',
        {
            name: getMessage('settings.imageInText.label'),
            hint: getMessage('settings.imageInText.hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: true,
        },
        onChangeMap,
    );

    register(
        'importPrivateEntities',
        {
            name: getMessage('settings.importPrivate.label'),
            hint: getMessage('settings.importPrivate.hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: true,
        },
        onChangeMap,
    );

    register(
        'importTemplateEntities',
        {
            name: getMessage('settings.importTemplate.label'),
            hint: getMessage('settings.importTemplate.hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: false,
        },
        onChangeMap,
    );

    register(
        'disableExternalMentionLinks',
        {
            name: getMessage('settings.disableExternalLinks.label'),
            hint: getMessage('settings.disableExternalLinks.hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: false,
        },
        onChangeMap,
    );

    register(
        'questQuestStatusIcon',
        {
            name: getMessage('settings.questStatusIcon.label'),
            hint: getMessage('settings.questStatusIcon.hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: false,
        },
        onChangeMap,
    );

    register(
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
        onChangeMap,
    );

    register(
        'browserView',
        {
            scope: 'client',
            config: false,
            type: String,
            default: 'list',
        },
        onChangeMap,
    );

    Object.values(EntityType)
        .filter((type) => type !== EntityType.campaign)
        .forEach((type: EntityType) => register(
            `collapseType_${type}`,
            {
                scope: 'client',
                config: false,
                type: Boolean,
                default: false,
            },
            onChangeMap,
        ));

    return async () => {
        const promises = Object
            .entries(onChangeMap)
            .map(([setting, onChange]) => onChange(getSetting(setting as keyof KankaSettings) as unknown as undefined));

        await Promise.all(promises);
    };
}

if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        Array.from<string>(getGame().settings.settings.keys())
            .filter((key: string) => key.startsWith(moduleConfig.name))
            .forEach((key) => getGame().settings.settings.delete(key));
    });
}

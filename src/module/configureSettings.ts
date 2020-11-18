import CampaignRepository from '../kanka/CampaignRepository';
import KankaApi from '../kanka/KankaApi';
import { logError } from '../logger';
import moduleConfig from '../module.json';
import {
    MetaDataBasicVisibility,
    KankaSettings,
    MetaDataAttributeVisibility,
    MetaDataCharacterTraitVisibility,
} from '../types/KankaSettings';
import getSettings from './getSettings';
import KankaBrowser from './KankaBrowser';

const accessTokenInputName = `${moduleConfig.name}.${KankaSettings.accessToken}`;
const campaignInputName = `${moduleConfig.name}.${KankaSettings.campaign}`;

async function getCampaignChoices(token?: string): Promise<Record<string, string>> {
    if (!token) {
        return {
            '': game.i18n.localize('KANKA.SettingsCampaign.noToken'),
        };
    }

    try {
        const campaignChoices: Record<string, string> = {
            '': game.i18n.localize('KANKA.SettingsCampaign.pleaseChoose'),
        };

        const api = KankaApi.createRoot(token);
        const repo = new CampaignRepository(api);
        const campaigns = await repo.loadAll();

        campaigns.forEach((campaign) => {
            campaignChoices[campaign.id] = campaign.name;
        });

        return campaignChoices;
    } catch (error) {
        logError(error);
        return {
            '': game.i18n.localize('KANKA.Error.fetchError'),
        };
    }
}

async function updateWorldList(event: JQuery.TriggeredEvent): Promise<void> {
    const token = event.target.value;
    const choices = await getCampaignChoices(token);

    const select = $(`[name="${campaignInputName}"]`);
    select.empty();

    Object.entries(choices).forEach(([value, label]) => {
        const option = $(`<option value="${value}">${label}</option>`);
        select.append(option);
    });

    select.val(getSettings(KankaSettings.campaign));
}

export function clearSettings(): void {
    Array
        .from<string>(game.settings.settings.keys())
        .filter((key: string) => key.startsWith(moduleConfig.name))
        .forEach(key => game.settings.settings.delete(key));

    $(document).off('change', `[name="${accessTokenInputName}"]`, updateWorldList);
}

export async function registerSettings(): Promise<void> {
    $(document).on('change', `[name="${accessTokenInputName}"]`, updateWorldList);

    game.settings.register(
        moduleConfig.name,
        KankaSettings.accessToken,
        {
            name: game.i18n.localize('KANKA.SettingsToken.label'),
            hint: game.i18n.localize('KANKA.SettingsToken.hint'),
            scope: 'world',
            config: true,
            type: String,
            default: '',
            onChange(value) {
                game.modules.get(moduleConfig.name).api.setToken(value);
            },
        },
    );

    game.settings.register(
        moduleConfig.name,
        KankaSettings.campaign,
        {
            name: game.i18n.localize('KANKA.SettingsCampaign.label'),
            hint: game.i18n.localize('KANKA.SettingsCampaign.hint'),
            scope: 'world',
            config: true,
            type: String,
            default: '',
            choices: await getCampaignChoices(getSettings(KankaSettings.accessToken)),
            onChange() {
                Object
                    .values(ui.windows)
                    .find(a => a.constructor === KankaBrowser)
                    ?.render(false);
            },
        },
    );

    game.settings.register(
        moduleConfig.name,
        KankaSettings.importPrivateEntities,
        {
            name: game.i18n.localize('KANKA.SettingsImportPrivateEntities.label'),
            hint: game.i18n.localize('KANKA.SettingsImportPrivateEntities.hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: true,
        },
    );

    game.settings.register(
        moduleConfig.name,
        KankaSettings.metaDataBasicVisibility,
        {
            name: game.i18n.localize('KANKA.SettingsMetaDataBasicVisibility.label'),
            hint: game.i18n.localize('KANKA.SettingsMetaDataBasicVisibility.hint'),
            scope: 'world',
            config: true,
            type: String,
            default: MetaDataBasicVisibility.all,
            choices: {
                [MetaDataBasicVisibility.all]: game.i18n.localize('KANKA.SettingsMetaDataBasicVisibility.value.all'),
                [MetaDataBasicVisibility.none]: game.i18n.localize('KANKA.SettingsMetaDataBasicVisibility.value.none'),
            },
        },
    );

    game.settings.register(
        moduleConfig.name,
        KankaSettings.metaDataAttributeVisibility,
        {
            name: game.i18n.localize('KANKA.SettingsMetaDataAttributeVisibility.label'),
            hint: game.i18n.localize('KANKA.SettingsMetaDataAttributeVisibility.hint'),
            scope: 'world',
            config: true,
            type: String,
            default: MetaDataAttributeVisibility.publicStarred,
            choices: {
                [MetaDataAttributeVisibility.all]: game.i18n.localize('KANKA.SettingsMetaDataAttributeVisibility.value.all'),
                [MetaDataAttributeVisibility.allStarred]: game.i18n.localize('KANKA.SettingsMetaDataAttributeVisibility.value.allStarred'),
                [MetaDataAttributeVisibility.public]: game.i18n.localize('KANKA.SettingsMetaDataAttributeVisibility.value.public'),
                [MetaDataAttributeVisibility.publicStarred]: game.i18n.localize('KANKA.SettingsMetaDataAttributeVisibility.value.publicStarred'),
                [MetaDataAttributeVisibility.none]: game.i18n.localize('KANKA.SettingsMetaDataAttributeVisibility.value.none'),
            },
        },
    );

    game.settings.register(
        moduleConfig.name,
        KankaSettings.metaDataCharacterTraitVisibility,
        {
            name: game.i18n.localize('KANKA.SettingsMetaDataCharacterTraitVisibility.label'),
            hint: game.i18n.localize('KANKA.SettingsMetaDataCharacterTraitVisibility.hint'),
            scope: 'world',
            config: true,
            type: String,
            default: MetaDataCharacterTraitVisibility.all,
            choices: {
                [MetaDataCharacterTraitVisibility.all]: game.i18n.localize('KANKA.SettingsMetaDataCharacterTraitVisibility.value.all'),
                [MetaDataCharacterTraitVisibility.appearance]: game.i18n.localize('KANKA.SettingsMetaDataCharacterTraitVisibility.value.appearance'),
                [MetaDataCharacterTraitVisibility.personality]: game.i18n.localize('KANKA.SettingsMetaDataCharacterTraitVisibility.value.personality'),
                [MetaDataCharacterTraitVisibility.none]: game.i18n.localize('KANKA.SettingsMetaDataCharacterTraitVisibility.value.none'),
            },
        },
    );

    game.settings.register(
        moduleConfig.name,
        KankaSettings.imageInText,
        {
            name: game.i18n.localize('KANKA.SettingsImageInText.label'),
            hint: game.i18n.localize('KANKA.SettingsImageInText.hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: false,
        },
    );

    game.settings.sheet.render(); // update sheet if it already visible
}

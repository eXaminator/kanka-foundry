import api from '../kanka/api';
import CampaignRepository from '../kanka/CampaignRepository';
import Campaign from '../kanka/entities/Campaign';
import { cache } from '../kanka/KankaNodeCache';
import { logError } from '../logger';
import moduleConfig from '../module.json';
import EntityType from '../types/EntityType';
import {
    EntityNotesVisibility, kankaBrowserTypeCollapseSetting,
    kankaImportTypeSetting,
    KankaSettings,
    MetaDataAttributeVisibility,
    MetaDataBasicVisibility,
    MetaDataCharacterTraitVisibility,
    MetaDataInventoryVisibility,
    MetaDataQuestReferenceVisibility,
} from '../types/KankaSettings';
import validateAccessToken from '../util/validateAccessToken';
import { getSetting } from './accessSettings';
import KankaBrowser from './KankaBrowser';

const supportedLanguages = moduleConfig.languages
    .reduce((map, { lang, name }) => ({ ...map, [lang]: name }), {});

const accessTokenInputName = `${moduleConfig.name}.${KankaSettings.accessToken}`;
const campaignInputName = `${moduleConfig.name}.${KankaSettings.campaign}`;

function buildCampaignChoices(campaigns: Campaign[]): Record<string, string> {
    const campaignChoices: Record<string, string> = {
        '': game.i18n.localize('KANKA.SettingsCampaign.pleaseChoose'),
    };

    campaigns.forEach((campaign) => {
        campaignChoices[campaign.id as number] = campaign.name;
    });

    return campaignChoices;
}

async function fetchInitialCampaignChoices(): Promise<Record<string, string>> {
    if (!getSetting(KankaSettings.accessToken)) {
        return {
            '': game.i18n.localize('KANKA.SettingsCampaign.noToken'),
        };
    }

    try {
        const campaigns = await game.modules.get(moduleConfig.name).loadAllCampaigns();

        return buildCampaignChoices(campaigns);
    } catch (error) {
        logError('Error while fetching initial campaign choices', error);
        return {
            '': game.i18n.localize('KANKA.Error.fetchError'),
        };
    }
}

async function fetchCampaignChoicesByToken(token?: string): Promise<Record<string, string>> {
    if (!token) {
        return {
            '': game.i18n.localize('KANKA.SettingsCampaign.noToken'),
        };
    }

    try {
        cache.clear(Campaign); // Clear campaign cache to ensure all campaigns are reloaded
        const currentToken = api.token;

        api.token = token;
        const repo = new CampaignRepository();
        const campaigns = await repo.loadAll();
        api.token = currentToken;

        return buildCampaignChoices(campaigns);
    } catch (error) {
        logError('Error while fetching campaign choices with new token', error);
        return {
            '': game.i18n.localize('KANKA.Error.fetchError'),
        };
    }
}

async function updateWorldList(event: JQuery.TriggeredEvent): Promise<void> {
    const token = event.target.value;
    const choices = await fetchCampaignChoicesByToken(token);

    const select = $(`[name="${campaignInputName}"]`);
    select.empty();

    Object.entries(choices).forEach(([value, label]) => {
        const option = $(`<option value="${value}">${label}</option>`);
        select.append(option);
    });

    select.val(getSetting(KankaSettings.campaign));
}

export function clearSettings(): void {
    Array
        .from<string>(game.settings.settings.keys())
        .filter((key: string) => key.startsWith(moduleConfig.name))
        .forEach(key => game.settings.settings.delete(key));

    $(document).off('change', `[name="${accessTokenInputName}"]`, updateWorldList);
}

export async function registerSettings(): Promise<void> {
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
                validateAccessToken(value);
                api.token = value;
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
            choices: await fetchInitialCampaignChoices(),
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
        KankaSettings.importLanguage,
        {
            name: game.i18n.localize('KANKA.SettingsImportLanguage.label'),
            hint: game.i18n.localize('KANKA.SettingsImportLanguage.hint'),
            scope: 'world',
            config: true,
            type: String,
            default: '',
            choices: {
                '': game.i18n.localize('KANKA.SettingsImportLanguage.default'),
                ...supportedLanguages,
            },
        },
    );

    game.settings.register(
        moduleConfig.name,
        KankaSettings.keepTreeStructure,
        {
            name: game.i18n.localize('KANKA.SettingsKeepTreeStructure.label'),
            hint: game.i18n.localize('KANKA.SettingsKeepTreeStructure.hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: false,
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
        KankaSettings.disableExternalMentionLinks,
        {
            name: game.i18n.localize('KANKA.SettingsDisableExternalMentionLinks.label'),
            hint: game.i18n.localize('KANKA.SettingsDisableExternalMentionLinks.hint'),
            scope: 'world',
            config: true,
            type: Boolean,
            default: false,
        },
    );

    game.settings.register(
        moduleConfig.name,
        KankaSettings.entityNotesVisibility,
        {
            name: game.i18n.localize('KANKA.SettingsEntityNotesVisibility.label'),
            hint: game.i18n.localize('KANKA.SettingsEntityNotesVisibility.hint'),
            scope: 'world',
            config: true,
            type: String,
            default: EntityNotesVisibility.all,
            choices: {
                [EntityNotesVisibility.all]: game.i18n.localize('KANKA.SettingsEntityNotesVisibility.value.all'),
                [EntityNotesVisibility.public]: game.i18n.localize('KANKA.SettingsEntityNotesVisibility.value.public'),
                [EntityNotesVisibility.none]: game.i18n.localize('KANKA.SettingsEntityNotesVisibility.value.none'),
            },
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
        KankaSettings.metaDataInventoryVisibility,
        {
            name: game.i18n.localize('KANKA.SettingsMetaDataInventoryVisibility.label'),
            hint: game.i18n.localize('KANKA.SettingsMetaDataInventoryVisibility.hint'),
            scope: 'world',
            config: true,
            type: String,
            default: MetaDataInventoryVisibility.public,
            choices: {
                [MetaDataInventoryVisibility.all]: game.i18n.localize('KANKA.SettingsMetaDataInventoryVisibility.value.all'),
                [MetaDataInventoryVisibility.public]: game.i18n.localize('KANKA.SettingsMetaDataInventoryVisibility.value.public'),
                [MetaDataInventoryVisibility.none]: game.i18n.localize('KANKA.SettingsMetaDataInventoryVisibility.value.none'),
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
        KankaSettings.metaDataQuestReferenceVisibility,
        {
            name: game.i18n.localize('KANKA.SettingsMetaDataQuestReferenceVisibility.label'),
            hint: game.i18n.localize('KANKA.SettingsMetaDataQuestReferenceVisibility.hint'),
            scope: 'world',
            config: true,
            type: String,
            default: MetaDataQuestReferenceVisibility.public,
            choices: {
                [MetaDataQuestReferenceVisibility.all]: game.i18n.localize('KANKA.SettingsMetaDataQuestReferenceVisibility.value.all'),
                [MetaDataQuestReferenceVisibility.public]: game.i18n.localize('KANKA.SettingsMetaDataQuestReferenceVisibility.value.public'),
                [MetaDataQuestReferenceVisibility.none]: game.i18n.localize('KANKA.SettingsMetaDataQuestReferenceVisibility.value.none'),
            },
        },
    );

    Object
        .values(EntityType)
        .filter(type => type !== EntityType.campaign)
        .forEach((type: EntityType) => {
            game.settings.register(
                moduleConfig.name,
                kankaImportTypeSetting(type),
                {
                    name: game.i18n.localize(`KANKA.EntityType.${type}`),
                    hint: game.i18n.localize('KANKA.SettingsEntityTypeVisibility.hint'),
                    scope: 'world',
                    config: true,
                    type: Boolean,
                    default: true,
                },
            );

            game.settings.register(
                moduleConfig.name,
                kankaBrowserTypeCollapseSetting(type),
                {
                    scope: 'client',
                    config: true,
                    type: Boolean,
                    default: false,
                },
            );
        });

    game.settings.sheet.render(); // update sheet if it already visible
    $(document).on('change', `[name="${accessTokenInputName}"]`, updateWorldList);
}

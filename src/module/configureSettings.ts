import { logError } from '../logger';
import moduleConfig from '../module.json';
import KankaSettings from '../types/KankaSettings';
import getSettings from './getSettings';
import { getCampaigns } from './kanka';

const accessTokenInputName = `${moduleConfig.name}.${KankaSettings.accessToken}`;
const campaignInputName = `${moduleConfig.name}.${KankaSettings.campaign}`;

async function getCampaignChoices(token?: string): Promise<Record<string, string>> {
    if (!token) {
        return {
            '': game.i18n.localize('KANKA.SettingsCampaignNoToken'),
        };
    }

    try {
        const campaignChoices: Record<string, string> = {
            '': game.i18n.localize('KANKA.SettingsCampaignPleaseChoose'),
        };
        const campaignsResult = await getCampaigns(token);

        campaignsResult.data.forEach((campaign) => {
            campaignChoices[campaign.id] = campaign.name;
        });

        return campaignChoices;
    } catch (error) {
        logError(error);
        return {
            '': game.i18n.localize('KANKA.SettingsCampaignInvalidToken'),
        };
    }
}

async function updateWorldList(event: any): Promise<void> {
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
            name: game.i18n.localize('KANKA.SettingsTokenLabel'),
            hint: game.i18n.localize('KANKA.SettingsTokenHint'),
            scope: 'world',
            config: true,
            type: String,
            default: '',
        },
    );

    game.settings.register(
        moduleConfig.name,
        KankaSettings.campaign,
        {
            name: game.i18n.localize('KANKA.SettingsCampaignLabel'),
            hint: game.i18n.localize('KANKA.SettingsCampaignHint'),
            scope: 'world',
            config: true,
            type: String,
            default: '',
            choices: await getCampaignChoices(getSettings(KankaSettings.accessToken)),
        },
    );

    game.settings.sheet.render(); // update sheet if it already visible
}

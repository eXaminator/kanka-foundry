import kanka from '../kanka';
import AccessToken from '../api/AccessToken';
import KankaApi from '../api/KankaApi';
import { logError, logInfo } from '../logger';
import { KankaApiCampaign } from '../types/kanka';
import { KankaSettings } from '../types/KankaSettings';

const accessTokenInputName = `${kanka.name}.${KankaSettings.accessToken}`;
const campaignInputName = `${kanka.name}.${KankaSettings.campaign}`;

function buildCampaignChoices(campaigns: KankaApiCampaign[]): Record<string, string> {
    const campaignChoices: Record<string, string> = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '': kanka.getMessage('settings.campaign.pleaseChoose'),
    };

    campaigns.forEach((campaign) => {
        campaignChoices[campaign.id as number] = campaign.name;
    });

    return campaignChoices;
}

async function fetchCampaignChoices(api: KankaApi): Promise<Record<string, string>> {
    const campaigns = await api.getAllCampaigns();
    return buildCampaignChoices(campaigns);
}

function setCampaignChoices(choices: Record<string, string>, value: string | null = null): void {
    const select = $(`[name="${campaignInputName}"]`);
    select.empty();

    Object.entries(choices).forEach(([value, label]) => {
        const option = $(`<option value="${value}">${label}</option>`);
        select.append(option);
    });

    select.val(value ?? String(kanka.currentCampaign?.id ?? ''));
}

function setCampaignSelectionError(key: string): void {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    setCampaignChoices({ '': kanka.getMessage(key) }, '');
}

async function onAccessTokenChange(event: JQuery.TriggeredEvent<unknown, string>): Promise<void> {
    const token = event.target.value;

    if (!token) {
        setCampaignSelectionError('settings.campaign.noToken');
        return;
    }

    const api = new KankaApi();

    try {
        const accessToken = new AccessToken(token);

        if (accessToken.isExpired()) {
            setCampaignSelectionError('settings.error.ErrorTokenExpired');
            return;
        }

        if (accessToken.isExpiredWithin(7 * 24 * 60 * 60)) { // One week
            setCampaignSelectionError('settings.error.WarningTokenExpiration');
            return;
        }

        api.switchUser(accessToken);
    } catch (error) {
        logError('Error while changing token', error);
        setCampaignSelectionError('settings.error.ErrorInvalidAccessToken');
        return;
    }

    try {
        const choices = await fetchCampaignChoices(api);
        setCampaignChoices(choices);
    } catch (error) {
        logError('Error while fetching campaign choices with new token', error);
        setCampaignSelectionError('settings.error.fetchError');
    }
}

export default async function renderSettingsConfig(app: SettingsConfig, html: JQuery<HTMLDivElement>): Promise<void> {
    html.on('change', `[name="${accessTokenInputName}"]`, onAccessTokenChange);

    logInfo('Load campaigns...');
    const choices = await fetchCampaignChoices(kanka.api);
    setCampaignChoices(choices);
}

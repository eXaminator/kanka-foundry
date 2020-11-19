import CampaignRepository from '../kanka/CampaignRepository';
import KankaApi from '../kanka/KankaApi';
import { logInfo } from '../logger';
import moduleConfig from '../module.json';
import { clearSettings, registerSettings } from '../module/configureSettings';
import getSetting from '../module/getSettings';
import preloadTemplates from '../module/preloadTemplates';
import { KankaEntityData } from '../types/kanka';
import { KankaSettings } from '../types/KankaSettings';

function getApi(): KankaApi<KankaEntityData> {
    if (!game.modules.get(moduleConfig.name).api) {
        game.modules.get(moduleConfig.name).api = KankaApi.createRoot(getSetting(KankaSettings.accessToken));
    }

    return game.modules.get(moduleConfig.name).api;
}

function getRepository(): CampaignRepository {
    if (!game.modules.get(moduleConfig.name).campaigns) {
        game.modules.get(moduleConfig.name).campaigns = new CampaignRepository(getApi());
    }

    return game.modules.get(moduleConfig.name).campaigns;
}

export default async function init(): Promise<void> {
    logInfo('Initializing');

    game.modules.get(moduleConfig.name).setApiToken = (token: string) => getApi().setToken(token);
    game.modules.get(moduleConfig.name).loadAllCampaigns = () => getRepository().loadAll();
    game.modules.get(moduleConfig.name).loadCurrentCampaign = () => (
        getRepository().loadById(Number(getSetting(KankaSettings.campaign)))
    );

    await registerSettings();
    await preloadTemplates();
}

if (module.hot) {
    module.hot.dispose(() => {
        clearSettings();
    });
}

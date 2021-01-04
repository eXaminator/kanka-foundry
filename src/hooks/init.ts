import api from '../kanka/api';
import CampaignRepository from '../kanka/CampaignRepository';
import { cache } from '../kanka/KankaNodeCache';
import { logInfo } from '../logger';
import moduleConfig from '../module.json';
import { clearSettings, registerSettings } from '../module/configureSettings';
import { getSetting } from '../module/accessSettings';
import preloadTemplates from '../module/preloadTemplates';
import { KankaSettings } from '../types/KankaSettings';
import validateAccessToken from '../util/validateAccessToken';

function getRepository(): CampaignRepository {
    if (!game.modules.get(moduleConfig.name).campaigns) {
        game.modules.get(moduleConfig.name).campaigns = new CampaignRepository();
    }

    if (!api.token) {
        api.token = getSetting(KankaSettings.accessToken);
    }

    return game.modules.get(moduleConfig.name).campaigns;
}

export default async function init(): Promise<void> {
    logInfo('Initializing');

    game.modules.get(moduleConfig.name).clearApiCache = () => {
        cache.clear();
        api.cache.clear();
    };
    game.modules.get(moduleConfig.name).loadAllCampaigns = () => getRepository().loadAll();
    game.modules.get(moduleConfig.name).loadCurrentCampaign = async () => {
        const id = getSetting(KankaSettings.campaign);
        if (!id) throw new Error('No campaign selected');
        return getRepository().loadById(Number(getSetting(KankaSettings.campaign)));
    };

    await registerSettings();
    await preloadTemplates();

    validateAccessToken(getSetting(KankaSettings.accessToken));
}

if (module.hot) {
    module.hot.dispose(() => {
        clearSettings();
    });
}

import CampaignRepository from '../kanka/CampaignRepository';
import KankaApi from '../kanka/KankaApi';
import { logInfo } from '../logger';
import moduleConfig from '../module.json';
import { clearSettings, registerSettings } from '../module/configureSettings';
import getSettings from '../module/getSettings';
import preloadTemplates from '../module/preloadTemplates';
import KankaSettings from '../types/KankaSettings';

export default async function init(): Promise<void> {
    logInfo('Initializing');

    await registerSettings();
    await preloadTemplates();

    const api = KankaApi.createRoot(getSettings(KankaSettings.accessToken));
    game.modules.get(moduleConfig.name).campaigns = new CampaignRepository(api);
}

if (module.hot) {
    module.hot.dispose(() => {
        clearSettings();
    });
}

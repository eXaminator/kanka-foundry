import executeMigrations from '../../executeMigrations';
import { setCurrentCampaignById } from '../../state/currentCampaign';
import localization from '../../state/localization';
import { logError } from '../../util/logger';
import getGame from '../getGame';
import { showError } from '../notifications';
import { getSetting } from '../settings';

export default async function setup(): Promise<void> {
    try {
        await localization.initialize();
        await localization.setLanguage(getSetting('importLanguage') ?? getGame().i18n.lang);

        if (getGame().user?.isGM) {
            await setCurrentCampaignById(parseInt(getSetting('campaign'), 10));
            await executeMigrations();
        }
    } catch (error) {
        logError(error);
        showError('general.initializationError');
    }
}

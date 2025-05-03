import executeMigrations from '../../executeMigrations';
import localization from '../../state/localization';
import { logError } from '../../util/logger';
import { showError } from '../notifications';

export default async function setup(): Promise<void> {
    try {
        await localization.initialize();
        await localization.setLanguage(game.settings?.get('kanka-foundry', 'importLanguage') ?? game.i18n?.lang ?? 'en');

        if (game.user?.isGM) {
            await executeMigrations();
        }
    } catch (error) {
        logError(error);
        showError('general.initializationError');
    }
}

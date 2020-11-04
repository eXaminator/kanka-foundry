import { logInfo } from '../logger';
import preloadTemplates from '../module/preloadTemplates';
import { clearSettings, registerSettings } from '../module/configureSettings';

export default async function init(): Promise<void> {
    logInfo('Initializing');
    await registerSettings();

    await preloadTemplates();
}

if (module.hot) {
    module.hot.dispose(() => {
        clearSettings();
    });
}

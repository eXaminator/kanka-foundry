import { info } from '../logger';
import preloadTemplates from '../module/preloadTemplates';
import { clearSettings, registerSettings } from '../module/settings';

export default async function init(...args: unknown[]): Promise<void> {
    info('Initializing', args);
    registerSettings();
    game.settings.sheet.render(); // update sheet if it already visible

    await preloadTemplates();
}

if (module.hot) {
    module.hot.dispose(() => {
        clearSettings();
    });
}

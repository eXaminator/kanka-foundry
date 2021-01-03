import logo from '../assets/kanka.png';
import { logInfo } from '../logger';
import moduleConfig from '../module.json';
import { getSetting } from '../module/accessSettings';
import KankaBrowser from '../module/KankaBrowser';
import { KankaSettings } from '../types/KankaSettings';

let button: JQuery<HTMLButtonElement> | undefined;

export default async function renderJournalDirectory(app: JournalSheet, html: JQuery<HTMLDivElement>): Promise<void> {
    if (!game.user.isGM) return;

    logInfo('renderJournalDirectory');

    button = $(`
        <button type="button" id="kanka">
            <img src="${logo}" title="${game.i18n.localize('KANKA.SidebarButton')}" />
        </button>
    `);

    button.on('click', () => {
        if (!game.user.isGM) return;

        if (module.hot) {
            delete _templateCache[`modules/${moduleConfig.name}/templates/journal.html`];
            delete _templateCache[`modules/${moduleConfig.name}/templates/entityList.html`];
        }

        game.modules.get(moduleConfig.name).clearApiCache();

        if (!getSetting(KankaSettings.accessToken)) {
            ui.notifications.error(game.i18n.localize('KANKA.ErrorProvideAccessToken'));
            return;
        }

        const journal = new KankaBrowser();
        journal.render(true);
    });

    html.find('.header-actions').append(button);
}

if (module.hot) {
    module.hot.dispose(() => {
        button?.remove();
    });
}

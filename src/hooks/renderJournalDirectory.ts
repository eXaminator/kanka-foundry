import logo from '../assets/kanka.png';
import { logInfo } from '../logger';
import getSetting from '../module/getSettings';
import KankaSettings from '../types/KankaSettings';

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
        if (!getSetting(KankaSettings.accessToken)) {
            ui.notifications.error(game.i18n.localize('KANKA.ErrorProvideAccessToken'));
        }

        // Do actual stuff
    });

    html.find('.header-actions').append(button);

    // Re-render the browser, if it's active
    /* const browser = Object.values(ui.windows).find(a => a.constructor === WorldAnvilBrowser);
     if (browser) browser.render(false); */
}

if (module.hot) {
    module.hot.dispose(() => {
        button?.remove();
    });
}

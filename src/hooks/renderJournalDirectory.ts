import KankaBrowserApplication from '../KankaBrowser/KankaBrowserApplication';
import logo from '../assets/kanka.png';
import kanka from '../kanka';
import { logInfo } from '../logger';

let button: JQuery<HTMLButtonElement> | undefined;

export default async function renderJournalDirectory(app: JournalSheet, html: JQuery<HTMLDivElement>): Promise<void> {
    const isGm = !!(game as Game).user?.isGM;
    if (!isGm) return;

    logInfo('renderJournalDirectory');

    const browserApplication = new KankaBrowserApplication();

    button = $(`
        <button type="button" id="kanka">
            <img
                src="${logo}" 
                title="${kanka.getMessage('sidebar.button')}"
                alt="${kanka.getMessage('sidebar.button')}"
            />
        </button>
    `);

    button.on('click', () => {
        if (!isGm) return;

        if (!kanka.isInitialized) {
            kanka.showError('browser.error.initializationError');
            return;
        }

        if (!kanka.api.isReady) {
            kanka.showError('browser.error.provideAccessToken');
            return;
        }

        if (!kanka.currentCampaign) {
            kanka.showError('browser.error.selectCampaign');
            return;
        }

        browserApplication.render(true);
        browserApplication.bringToTop();
        browserApplication.maximize();
    });

    html.find('.header-actions').append(button);
}

if (module.hot) {
    module.hot.dispose(() => {
        button?.remove();
    });
}

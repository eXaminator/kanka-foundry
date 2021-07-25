import KankaBrowserApplication from '../KankaBrowser/KankaBrowserApplication';
import logo from '../assets/kanka.png';
import kanka from '../kanka';
import { logInfo } from '../logger';
import { KankaApiQuest } from '../types/kanka';

let button: JQuery<HTMLButtonElement> | undefined;

const questStatus = {
    complete: '<i class="fas fa-check-circle kanka-quest-status -complete"></i>',
    open: '<i class="fas fa-circle kanka-quest-status -open"></i>',
};

export default async function renderJournalDirectory(
    app: JournalDirectory,
    html: JQuery<HTMLDivElement>,
): Promise<void> {
    const isGm = !!(game as Game).user?.isGM;
    if (!isGm) return;

    logInfo('renderJournalDirectory');

    if (kanka.settings.questStatusIcon) {
        const questEntries = kanka.journals.findAllByType('quest');
        questEntries.forEach((entry) => {
            const li = html.find(`[data-entity-id="${entry.id}"]`);
            const link = li.find('.entity-name a');
            const snapshot = kanka.journals.getFlag(entry, 'snapshot') as KankaApiQuest;

            link.html(`${snapshot.is_completed ? questStatus.complete : questStatus.open} ${snapshot.name}`);
        });
    }

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

    button.on('click', async () => {
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

        browserApplication.render(true, { focus: true });
    });

    html.find('.header-actions').append(button);
}

if (module.hot) {
    module.hot.dispose(() => {
        button?.remove();
    });
}

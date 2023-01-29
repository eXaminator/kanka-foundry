import KankaBrowserApplication from '../KankaBrowser/KankaBrowserApplication';
import logo from '../assets/kanka.png';
import kanka from '../kanka';
import { logInfo } from '../logger';
import { KankaApiQuest } from '../types/kanka';
import { getSetting } from '../module/settings';
import { showError } from '../module/notifications';
import getMessage from '../module/getMessage';
import api from '../module/api';

let button: JQuery<HTMLButtonElement> | undefined;

const questStatus = {
    complete: '<i class="fas fa-check-circle kanka-quest-status -complete"></i>',
    open: '<i class="fas fa-circle kanka-quest-status -open"></i>',
};

function renderQuestStatusIcons(html: JQuery<HTMLDivElement>): void {
    if (!getSetting('questQuestStatusIcon')) return;

    const questEntries = kanka.journals.findAllByType('quest');
    questEntries.forEach((entry) => {
        const li = html.find(`[data-document-id="${entry.id}"]`);
        const link = li.find('.document-name a');
        const snapshot = kanka.journals.getFlag(entry, 'snapshot') as KankaApiQuest;

        link.html(
            `${snapshot.is_completed ? questStatus.complete : questStatus.open} ${snapshot.name}`,
        );
    });
}

function renderKankaButton(html: JQuery<HTMLDivElement>): void {
    const isGm = !!(game as Game).user?.isGM;
    if (!isGm) return;

    const browserApplication = new KankaBrowserApplication();

    button = $(`
        <button type="button" id="kanka">
            <img
                src="${logo}" 
                title="${getMessage('sidebar.button')}"
                alt="${getMessage('sidebar.button')}"
            /> Kanka
        </button>
    `);

    button.on('click', async () => {
        if (!isGm) return;

        if (!kanka.isInitialized) {
            showError('browser.error.initializationError');
            return;
        }

        if (!api.isReady) {
            showError('browser.error.provideAccessToken');
            return;
        }

        if (!kanka.currentCampaign) {
            showError('browser.error.selectCampaign');
            return;
        }

        browserApplication.render(true, { focus: true });
    });

    html.find('.directory-footer').append(button);
}

export default async function renderJournalDirectory(
    app: JournalDirectory,
    html: JQuery<HTMLDivElement>,
): Promise<void> {
    logInfo('renderJournalDirectory');
    renderQuestStatusIcons(html);
    renderKankaButton(html);
}

if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        button?.remove();
    });
}

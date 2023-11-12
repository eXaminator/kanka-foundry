import KankaBrowserApplication from '../../apps/KankaBrowser/KankaBrowserApplication';
import logo from '../../assets/kanka.png';
import { logInfo } from '../../util/logger';
import api from '../../api';
import getGame from '../getGame';
import getMessage from '../getMessage';
import { findEntriesByType, getEntryFlag } from '../journalEntries';
import { showError, showWarning } from '../notifications';
import { getSetting } from '../settings';
import { KankaApiQuest } from '../../types/kanka';

const questStatus = {
    complete: '<i class="fas fa-check-circle kanka-quest-status -complete"></i>',
    open: '<i class="fas fa-circle kanka-quest-status -open"></i>',
};

function renderQuestStatusIcons(html: JQuery<HTMLDivElement>): void {
    if (!getSetting('questQuestStatusIcon')) return;

    const questEntries = findEntriesByType('quest');
    questEntries.forEach((entry) => {
        const li = html.find(`[data-document-id="${entry.id as string}"]`);
        const link = li.find('.document-name a');
        const snapshot = getEntryFlag(entry, 'snapshot') as KankaApiQuest;

        link.html(
            `${snapshot.is_completed ? questStatus.complete : questStatus.open} ${snapshot.name}`,
        );
    });
}

function renderKankaButton(html: JQuery<HTMLDivElement>): void {
    const isGm = !!getGame().user?.isGM;
    if (!isGm) return;

    const browserApplication = new KankaBrowserApplication();

    const button = $(`
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

        const accessToken = api.getToken();

        if (!api.isReady || !accessToken) {
            showError('browser.error.provideAccessToken');
            return;
        }

        if (accessToken.isExpired()) {
            showError('settings.error.ErrorTokenExpired');
            return;
        }

        if (accessToken.isExpiredWithin(7 * 24 * 60 * 60)) { // One week
            showWarning('settings.error.WarningTokenExpiration');
        }

        browserApplication.render(true, { focus: true });
    });

    html.find('.directory-footer').find('#kanka').remove();
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

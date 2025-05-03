import api from '../../api';
import KankaBrowserApplication from '../../apps/KankaBrowser/KankaBrowserApplication';
import logo from '../../assets/kanka.png';
import type { KankaApiQuest } from '../../types/kanka';
import { logInfo } from '../../util/logger';
import getMessage from '../getMessage';
import { findEntriesByType } from '../journalEntries';
import { showError, showWarning } from '../notifications';

const questStatus = {
    complete: '<i class="fas fa-check-circle knk:quest-status -complete"></i>',
    open: '<i class="fas fa-circle knk:quest-status -open"></i>',
};

function renderQuestStatusIcons(html: JQuery<HTMLDivElement>): void {
    if (!game.settings?.get('kanka-foundry', 'questQuestStatusIcon')) return;

    const questEntries = findEntriesByType('quest');
    for (const entry of questEntries) {
        const li = $(html).find(`[data-document-id="${entry.id as string}"]`);
        const link = li.find('.document-name a');
        const snapshot = entry.getFlag('kanka-foundry', 'snapshot') as KankaApiQuest;

        link.html(`${snapshot.is_completed ? questStatus.complete : questStatus.open} ${snapshot.name}`);
    }
}

function renderKankaButton(html: JQuery<HTMLDivElement>): void {
    const isGm = !!game.user?.isGM;
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

        if (accessToken.isExpiredWithin(7 * 24 * 60 * 60)) {
            // One week
            showWarning('settings.error.WarningTokenExpiration');
        }

        browserApplication.render({ force: true });
    });

    $(html).find('.directory-footer').find('#kanka').remove();
    $(html).find('.directory-footer').append(button);
}

export default async function renderJournalDirectory(
    app: JournalDirectory,
    html: JQuery<HTMLDivElement>,
): Promise<void> {
    logInfo('renderJournalDirectory');
    renderQuestStatusIcons(html);
    renderKankaButton(html);
}

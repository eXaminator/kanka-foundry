import deleteJournalEntry from './hooks/deleteJournalEntry';
import hmrWrapHook from './hooks/hmrWrapHook';
import init from './hooks/init';
import renderJournalDirectory from './hooks/renderJournalDirectory';
import renderSettingsConfig from './hooks/renderSettingsConfig';
import './index.scss';
import './KankaJournal/KankaJournalApplication';

import.meta.glob('./lang/*.yml', { eager: true });

const refreshInit = hmrWrapHook('init', () => init, 'once');
const refreshRenderJournalDirectory = hmrWrapHook('renderJournalDirectory', () => renderJournalDirectory, 'on');
const refreshRenderSettingsConfig = hmrWrapHook('renderSettingsConfig', () => renderSettingsConfig, 'on');
const refreshDeleteJournalSheet = hmrWrapHook('deleteJournalEntry', () => deleteJournalEntry, 'on');

if (import.meta.hot) {
    import.meta.hot.accept('./hooks/init', refreshInit);
    import.meta.hot.accept('./hooks/renderJournalDirectory', refreshRenderJournalDirectory);
    import.meta.hot.accept('./hooks/renderSettingsConfig', refreshRenderSettingsConfig);
    import.meta.hot.accept('./hooks/deleteJournalEntry', refreshDeleteJournalSheet);

    import.meta.hot.on('update-hbs', async ({ file }) => {
        // eslint-disable-next-line no-console
        console.log('HMR: update-hbs', file);
        const kankaTemplates = Object
            .keys(_templateCache)
            .filter(key => key.includes('kanka-foundry'));

        kankaTemplates.forEach((key) => { delete _templateCache[key]; });

        await loadTemplates(kankaTemplates);

        Object
            .values(ui.windows)
            .forEach(a => {
                if (kankaTemplates.includes(a.template)) a.render(false);
            });
    });
}

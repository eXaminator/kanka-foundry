import deleteJournalEntry from './hooks/deleteJournalEntry';
import hmrWrapHook from './hooks/hmrWrapHook';
import init from './hooks/init';
import renderJournalDirectory from './hooks/renderJournalDirectory';
import renderSettingsConfig from './hooks/renderSettingsConfig';
import './index.scss';
import './KankaJournal/KankaJournalApplication';

const refreshInit = hmrWrapHook('init', () => init, 'once');
const refreshRenderJournalDirectory = hmrWrapHook('renderJournalDirectory', () => renderJournalDirectory, 'on');
const refreshRenderSettingsConfig = hmrWrapHook('renderSettingsConfig', () => renderSettingsConfig, 'on');
const refreshDeleteJournalSheet = hmrWrapHook('deleteJournalEntry', () => deleteJournalEntry, 'on');

if (module.hot) {
    module.hot.accept('./hooks/init', refreshInit);
    module.hot.accept('./hooks/renderJournalDirectory', refreshRenderJournalDirectory);
    module.hot.accept('./hooks/renderSettingsConfig', refreshRenderSettingsConfig);
    module.hot.accept('./hooks/deleteJournalEntry', refreshDeleteJournalSheet);
}

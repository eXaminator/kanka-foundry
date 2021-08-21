import deleteJournalEntry from './hooks/deleteJournalEntry';
import hmrWrapHook from './hooks/hmrWrapHook';
import init from './hooks/init';
import preDocumentSheetRegistrarInit from './hooks/preDocumentSheetRegistrarInit';
import ready from './hooks/ready';
import renderJournalDirectory from './hooks/renderJournalDirectory';
import renderSettingsConfig from './hooks/renderSettingsConfig';
import './index.scss';
import './KankaJournal/KankaJournalApplication';

const refreshPreDocumentSheetRegistrarInit = hmrWrapHook('preDocumentSheetRegistrarInit', () => preDocumentSheetRegistrarInit, 'once');
const refreshInit = hmrWrapHook('init', () => init, 'once');
const refreshReady = hmrWrapHook('ready', () => ready, 'once');
const refreshRenderJournalDirectory = hmrWrapHook('renderJournalDirectory', () => renderJournalDirectory, 'on');
const refreshRenderSettingsConfig = hmrWrapHook('renderSettingsConfig', () => renderSettingsConfig, 'on');
const refreshDeleteJournalSheet = hmrWrapHook('deleteJournalEntry', () => deleteJournalEntry, 'on');

if (module.hot) {
    module.hot.accept('./hooks/preDocumentSheetRegistrarInit', refreshPreDocumentSheetRegistrarInit);
    module.hot.accept('./hooks/init', refreshInit);
    module.hot.accept('./hooks/ready', refreshReady);
    module.hot.accept('./hooks/renderJournalDirectory', refreshRenderJournalDirectory);
    module.hot.accept('./hooks/renderSettingsConfig', refreshRenderSettingsConfig);
    module.hot.accept('./hooks/deleteJournalEntry', refreshDeleteJournalSheet);
}

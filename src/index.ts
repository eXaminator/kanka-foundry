import deleteJournalEntry from './hooks/deleteJournalEntry';
import documentSheetRegistrarInit from './hooks/documentSheetRegistrarInit';
import hmrWrapHook from './hooks/hmrWrapHook';
import init from './hooks/init';
import preDocumentSheetRegistrarInit from './hooks/preDocumentSheetRegistrarInit';
import renderJournalDirectory from './hooks/renderJournalDirectory';
import renderSettingsConfig from './hooks/renderSettingsConfig';
import './index.scss';
import './KankaJournal/KankaJournalApplication';

const refreshInit = hmrWrapHook('init', () => init, 'once');
const refreshPreDocumentSheetRegistrarInit = hmrWrapHook('preDocumentSheetRegistrarInit', () => preDocumentSheetRegistrarInit, 'once');
const refreshDocumentSheetRegistrarInit = hmrWrapHook('documentSheetRegistrarInit', () => documentSheetRegistrarInit, 'once');
const refreshRenderJournalDirectory = hmrWrapHook('renderJournalDirectory', () => renderJournalDirectory, 'on');
const refreshRenderSettingsConfig = hmrWrapHook('renderSettingsConfig', () => renderSettingsConfig, 'on');
const refreshDeleteJournalSheet = hmrWrapHook('deleteJournalEntry', () => deleteJournalEntry, 'on');

if (module.hot) {
    module.hot.accept('./hooks/init', refreshInit);
    module.hot.accept('./hooks/preDocumentSheetRegistrarInit', refreshPreDocumentSheetRegistrarInit);
    module.hot.accept('./hooks/documentSheetRegistrarInit', refreshDocumentSheetRegistrarInit);
    module.hot.accept('./hooks/renderJournalDirectory', refreshRenderJournalDirectory);
    module.hot.accept('./hooks/renderSettingsConfig', refreshRenderSettingsConfig);
    module.hot.accept('./hooks/deleteJournalEntry', refreshDeleteJournalSheet);
}

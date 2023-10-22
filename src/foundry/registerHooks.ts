import deleteJournalEntry from './hooks/deleteJournalEntry';
import hmrWrapHook from './hooks/hmrWrapHook';
import init from './hooks/init';
import renderJournalDirectory from './hooks/renderJournalDirectory';
import renderSettingsConfig from './hooks/renderSettingsConfig';
import ready from './hooks/ready';

const refreshInit = hmrWrapHook('init', () => init, 'once');
const refreshReady = hmrWrapHook('ready', () => ready, 'once');
const refreshRenderJournalDirectory = hmrWrapHook('renderJournalDirectory', () => renderJournalDirectory, 'on');
const refreshRenderSettingsConfig = hmrWrapHook('renderSettingsConfig', () => renderSettingsConfig, 'on');
const refreshDeleteJournalSheet = hmrWrapHook('deleteJournalEntry', () => deleteJournalEntry, 'on');

if (import.meta.hot) {
    import.meta.hot.accept('./hooks/init', refreshInit);
    import.meta.hot.accept('./hooks/ready', refreshReady);
    import.meta.hot.accept('./hooks/renderJournalDirectory', refreshRenderJournalDirectory);
    import.meta.hot.accept('./hooks/renderSettingsConfig', refreshRenderSettingsConfig);
    import.meta.hot.accept('./hooks/deleteJournalEntry', refreshDeleteJournalSheet);
}

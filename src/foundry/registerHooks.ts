import deleteJournalEntry from './hooks/deleteJournalEntry';
import hmrWrapHook from './hooks/hmrWrapHook';
import init from './hooks/init';
import ready from './hooks/ready';
import renderJournalDirectory from './hooks/renderJournalDirectory';

const refreshInit = hmrWrapHook('init', () => init, 'once');
const refreshReady = hmrWrapHook('ready', () => ready, 'once');
const refreshRenderJournalDirectory = hmrWrapHook('renderJournalDirectory', () => renderJournalDirectory, 'on');
const refreshDeleteJournalEntry = hmrWrapHook('deleteJournalEntry', () => deleteJournalEntry, 'on');
const refreshDeleteFolder = hmrWrapHook('deleteJournalEntry', () => deleteJournalEntry, 'on');

if (import.meta.hot) {
    import.meta.hot.accept('./hooks/init', refreshInit);
    import.meta.hot.accept('./hooks/ready', refreshReady);
    import.meta.hot.accept('./hooks/renderJournalDirectory', refreshRenderJournalDirectory);
    import.meta.hot.accept('./hooks/deleteJournalEntry', refreshDeleteJournalEntry);
    import.meta.hot.accept('./hooks/deleteJournalEntry', refreshDeleteFolder);
}

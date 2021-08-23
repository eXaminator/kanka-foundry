import kanka from '../kanka';
import registerSheet from '../KankaJournal/KankaJournalApplication';

export default async function documentSheetRegistrarInit(): Promise<void> {
    registerSheet(kanka);
}

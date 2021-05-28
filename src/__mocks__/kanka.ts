import KankaFoundry from '../KankaFoundry';
import KankaJournalHelper from '../module/KankaJournalHelper';

jest.mock('../KankaFoundry');
jest.mock('../module/KankaJournalHelper');

const kanka = new KankaFoundry() as jest.Mocked<KankaFoundry>;
const journalHelper = new KankaJournalHelper(kanka) as jest.Mocked<KankaJournalHelper>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
journalHelper.getFlag.mockImplementation((journal: any, flag) => journal?.flags?.[flag]);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
kanka.journals = journalHelper;

export default kanka;

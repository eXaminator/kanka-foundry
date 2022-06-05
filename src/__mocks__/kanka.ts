import { vi } from 'vitest';
import KankaFoundry from '../KankaFoundry';
import KankaJournalHelper from '../module/KankaJournalHelper';

vi.mock('../KankaFoundry', () => ({ default: vi.fn() }));
vi.mock('../module/KankaJournalHelper');

const kanka = vi.mocked(new KankaFoundry());
const journalHelper = vi.mocked(new KankaJournalHelper(kanka));

kanka.journals = journalHelper;

export default kanka;

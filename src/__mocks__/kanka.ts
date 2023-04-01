import { vi } from 'vitest';
import KankaFoundry from '../KankaFoundry';

vi.mock('../KankaFoundry', () => ({ default: vi.fn() }));
vi.mock('../module/KankaJournalHelper');

const kanka = vi.mocked(new KankaFoundry());

kanka.baseUrl = 'https://kanka.io';

export default kanka;

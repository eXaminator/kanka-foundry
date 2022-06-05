import { vi } from 'vitest';

export default vi.fn(() => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getFlag: vi.fn().mockImplementation((journal: any, flag) => journal?.flags?.[flag]),
    findByEntityId: vi.fn(),
    findByTypeAndId: vi.fn(),
}));

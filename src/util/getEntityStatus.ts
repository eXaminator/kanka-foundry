import type { KankaApiEntityStatus } from '../types/kanka';

/**
 * Boolean flags that were replaced by `status` in the Kanka API. Snapshots of entries
 * synced before that change only contain these flags.
 */
const legacyStatusFlags: Array<[flag: string, key: string]> = [
    ['is_dead', 'dead'],
    ['is_extinct', 'extinct'],
    ['is_destroyed', 'destroyed'],
    ['is_defunct', 'defunct'],
    ['is_completed', 'completed'],
];

export default function getEntityStatus(snapshot: Record<string, unknown> | null | undefined): KankaApiEntityStatus | null {
    if (!snapshot) return null;

    if (snapshot.status !== undefined) {
        return (snapshot.status as KankaApiEntityStatus | null) ?? null;
    }

    const legacy = legacyStatusFlags.find(([flag]) => snapshot[flag] === true);
    if (!legacy) return null;

    return { id: null, key: legacy[1], name: null, icon: null, is_custom: false };
}

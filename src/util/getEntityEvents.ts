import type { KankaApiRelated, KankaApiReminder } from '../types/kanka';

/**
 * Kanka returns reminders as `entity_events` and the deprecated `reminders`.
 */
export default function getEntityEvents(entity: Partial<Pick<KankaApiRelated, 'entity_events' | 'reminders'>>): KankaApiReminder[] {
    return entity.entity_events ?? entity.reminders ?? [];
}

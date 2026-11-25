import { describe, expect, it } from 'vitest';
import type { KankaApiReminder } from '../types/kanka';
import getEntityEvents from './getEntityEvents';

const event = (id: number) => ({ id }) as KankaApiReminder;

describe('getEntityEvents()', () => {
    it('prefers entity_events', () => {
        expect(getEntityEvents({ entity_events: [event(1)], reminders: [event(2)] })).toEqual([event(1)]);
    });

    it('falls back to reminders', () => {
        expect(getEntityEvents({ reminders: [event(2)] })).toEqual([event(2)]);
    });

    it('returns an empty array if neither is present', () => {
        expect(getEntityEvents({})).toEqual([]);
    });
});

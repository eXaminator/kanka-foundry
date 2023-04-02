/* eslint-disable promise/no-callback-in-promise,promise/catch-or-return */
import { vi } from 'vitest';
import RateLimiter from './RateLimiter';

vi.mock('../util/logger');
vi.useFakeTimers();

async function fakeTime(time: number): Promise<void> {
    vi.advanceTimersByTime(time);
    await Promise.resolve();
}

describe('RateLimiter', () => {
    describe('constructor', () => {
        it('sets correct remaining property', () => {
            const limiter = new RateLimiter(10, 5);

            expect(limiter.remaining).toEqual(5);
        });
    });

    describe('slot()', () => {
        it('resolves immediately if limiter as free slots', async () => {
            const cb = vi.fn();
            const limiter = new RateLimiter(10, 1);

            limiter.slot().then(cb);
            await fakeTime(0);

            expect(cb).toHaveBeenCalled();
        });

        it('resolves once a slot becomes available', async () => {
            const cb = vi.fn();
            const limiter = new RateLimiter(10, 1);

            limiter.slot().then(() => null); // First slot, runs immediately
            await fakeTime(5000);

            limiter.slot().then(cb); // Second call will be queued for rest of slot lifetime

            await fakeTime(4999);
            expect(cb).not.toHaveBeenCalled(); // The time is not up yet

            await fakeTime(1);
            expect(cb).toHaveBeenCalled(); // Now it should run
        });

        it('decreases the remaining property by 1', () => {
            const limiter = new RateLimiter(10, 2);

            expect(limiter.remaining).toEqual(2);

            limiter.slot().then(() => null);
            expect(limiter.remaining).toEqual(1);

            limiter.slot().then(() => null);
            expect(limiter.remaining).toEqual(0);

            limiter.slot().then(() => null); // This one will be queued, which doesn't change the remaining property
            expect(limiter.remaining).toEqual(0);
        });

        it('calls change listeners', async () => {
            const onChange = vi.fn();
            const limiter = new RateLimiter(10, 2);
            limiter.onChange(onChange);

            limiter.slot().then(() => null); // Run
            limiter.slot().then(() => null); // Run
            limiter.slot().then(() => null); // Queue

            // Call onChange once for each slot / queue
            expect(onChange).toHaveBeenCalledTimes(3);

            await fakeTime(10000); // Let the queued slot run

            // Run twice more: One when queued slot runs, the other when the 2. slot is freed
            expect(onChange).toHaveBeenCalledTimes(5);

            await fakeTime(10000); // Let the queued slot free up

            // Run once more after the last slot was freed
            expect(onChange).toHaveBeenCalledTimes(6);

            // The last call receives the following arguments
            expect(onChange).toHaveBeenCalledWith({
                maxSlots: 2,
                remainingSlots: 0,
                usedSlots: 2,
                queue: 1,
            });
        });
    });

    describe('reset()', () => {
        it('clears slots', async () => {
            const cb = vi.fn();
            const limiter = new RateLimiter(10, 1);

            limiter.slot().then(() => null); // First slot, runs immediately
            await fakeTime(0);

            limiter.reset();

            limiter.slot().then(cb); // This is the first slot again, so it runs immediately
            await fakeTime(0);

            expect(cb).toHaveBeenCalled(); // Now it should run
        });

        it('resets the remaining property', () => {
            const limiter = new RateLimiter(10, 2);

            limiter.slot().then(() => null);
            expect(limiter.remaining).toEqual(1);

            limiter.reset();

            expect(limiter.remaining).toEqual(2);
        });

        it('calls change listeners', () => {
            const onChange1 = vi.fn();
            const onChange2 = vi.fn();
            const limiter = new RateLimiter(10, 2);
            limiter.onChange(onChange1);
            limiter.onChange(onChange2);

            limiter.reset();

            expect(onChange1).toHaveBeenCalledWith({
                maxSlots: 2,
                remainingSlots: 2,
                usedSlots: 0,
                queue: 0,
            });

            expect(onChange2).toHaveBeenCalledWith({
                maxSlots: 2,
                remainingSlots: 2,
                usedSlots: 0,
                queue: 0,
            });
        });
    });

    describe('set remaining', () => {
        it('sets the new value correctly', () => {
            const limiter = new RateLimiter(10, 2);
            limiter.remaining = 1;

            expect(limiter.remaining).toEqual(1);
        });

        it('throws an exception if a negative value is set', () => {
            const limiter = new RateLimiter(10, 2);

            expect(() => { limiter.remaining = -1; }).toThrow(Error);
        });

        it('does nothing if the new remaining value is larger than the old one', () => {
            const limiter = new RateLimiter(10, 2);

            limiter.slot().then(() => null); // This will reduce remaining to 1

            limiter.remaining = 3;

            // Remaining has not changed
            expect(limiter.remaining).toEqual(1);
        });

        it('calls change listeners', () => {
            const onChange = vi.fn();
            const limiter = new RateLimiter(10, 2);
            limiter.onChange(onChange);

            limiter.remaining = 1;

            expect(onChange).toHaveBeenCalledWith({
                maxSlots: 2,
                remainingSlots: 1,
                usedSlots: 1,
                queue: 0,
            });
        });
    });

    describe('set limit', () => {
        it('sets the new remaining value correctly', () => {
            const limiter = new RateLimiter(10, 2);
            limiter.limit = 3;

            expect(limiter.remaining).toEqual(3);
        });

        it('throws an exception if a negative value is set', () => {
            const limiter = new RateLimiter(10, 2);

            expect(() => { limiter.limit = -1; }).toThrow(Error);
        });

        it('calls change listeners', () => {
            const onChange = vi.fn();
            const limiter = new RateLimiter(10, 2);
            limiter.onChange(onChange);

            limiter.limit = 4;

            expect(onChange).toHaveBeenCalledWith({
                maxSlots: 4,
                remainingSlots: 4,
                usedSlots: 0,
                queue: 0,
            });
        });
    });
});

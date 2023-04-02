import { logInfo } from '../util/logger';

interface ChangeEvent {
    usedSlots: number;
    maxSlots: number;
    remainingSlots: number;
    queue: number;
}

type ChangeListener = (event: ChangeEvent) => void;

export default class RateLimiter {
    #timeframe: number;
    #limit: number;
    #requestCounter = 0;
    #slots: ReturnType<typeof setTimeout>[] = [];
    #queue: (() => void)[] = [];
    #changeListeners: ChangeListener[] = [];

    constructor(timeframe: number, limit: number) {
        this.#timeframe = timeframe;
        this.#limit = limit;
    }

    public onChange(listener: ChangeListener): void {
        this.#changeListeners.push(listener);
    }

    public set limit(limit: number) {
        logInfo('RateLimiter - set limit', limit);

        if (limit < 0) {
            throw new Error('RateLimiter.limit must not be negative');
        }

        this.#limit = limit;
        this.callListeners();
    }

    public set remaining(remaining: number) {
        logInfo('RateLimiter - set remaining', { remaining, currentRemaining: this.remaining });

        if (remaining < 0) {
            throw new Error('RateLimiter.remaining must not be negative');
        }

        // never reduce the number of remaining slots due to problems that can occur with parallel requests
        while (remaining < this.remaining) {
            this.slot();
        }
    }

    public get remaining(): number {
        return this.#limit - this.#slots.length;
    }

    public reset(): void {
        this.#slots = [];
        this.#queue = [];
        this.#requestCounter = 0;
        this.callListeners();
    }

    public slot(): Promise<void> {
        // eslint-disable-next-line no-plusplus
        const id = ++this.#requestCounter;
        logInfo('RateLimiter - run', { id, slots: this.#slots.length, queue: this.#queue.length, currentRemaining: this.remaining });

        return new Promise((resolve) => {
            const run = (): void => {
                const timeout = setTimeout(() => this.freeSlot(timeout), this.#timeframe * 1000);
                this.#slots.push(timeout);
                this.callListeners();

                logInfo('RateLimiter - run now', { id });
                resolve();
            };

            if (this.remaining > 0) {
                run();
            } else {
                logInfo('RateLimiter – add to queue', { id });
                this.#queue.push(run);
                this.callListeners();
            }
        });
    }

    private freeSlot(slot?: NodeJS.Timeout): void {
        logInfo('RateLimiter - free slot', { previousRemaining: this.remaining });

        const index = slot ? this.#slots.indexOf(slot) : 0;

        if (index >= 0) {
            clearTimeout(slot ?? this.#slots[index]);
            this.#slots.splice(index, 1);
        }

        const runNext = this.#queue.shift();

        if (runNext) runNext();
        else this.callListeners();
    }

    private callListeners(): void {
        const event: ChangeEvent = {
            usedSlots: this.#slots.length,
            maxSlots: this.#limit,
            remainingSlots: this.remaining,
            queue: this.#queue.length,
        };

        this.#changeListeners.forEach(cb => cb({ ...event }));
    }
}

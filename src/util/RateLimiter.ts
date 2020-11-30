import { logInfo } from '../logger';

export default class RateLimiter {
    #timeframe: number;
    #limit: number;
    #requestCounter = 0;
    #slots: ReturnType<typeof setTimeout>[] = [];
    #queue: (() => void)[] = [];

    constructor(timeframe: number, limit: number) {
        this.#timeframe = timeframe;
        this.#limit = limit;
    }

    public set limit(limit: number) {
        this.#limit = limit;
    }

    public slot(): Promise<void> {
        // eslint-disable-next-line no-plusplus
        const id = ++this.#requestCounter;
        logInfo('RequestLimiter - run', { id, slots: this.#slots.length, queue: this.#queue.length });

        return new Promise((resolve) => {
            const run = (): void => {
                const timeout = setTimeout(() => {
                    logInfo('RequestLimiter - free slot', { id });
                    this.#slots.splice(this.#slots.indexOf(timeout), 1);
                    const runNext = this.#queue.shift();
                    if (runNext) runNext();
                }, this.#timeframe * 1000);
                this.#slots.push(timeout);

                logInfo('RequestLimiter - run now', { id });
                resolve();
            };

            if (this.#slots.length < this.#limit) {
                run();
            } else {
                logInfo('RequestLimiter – add to queue', { id });
                this.#queue.push(run);
            }
        });
    }
}

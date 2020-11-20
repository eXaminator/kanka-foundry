import { logInfo } from '../logger';

export default function createThrottle(seconds: number, limit: number): () => Promise<void> {
    const requestThrottleSlots: ReturnType<typeof setTimeout>[] = [];
    const requestThrottleQueue: (() => void)[] = [];
    let idCounter = 0;

    return () => {
        // eslint-disable-next-line no-plusplus
        const id = ++idCounter;
        logInfo('throttleRequest() - run', { id, slots: requestThrottleSlots.length, queue: requestThrottleQueue.length });

        return new Promise((resolve) => {
            const run = (): void => {
                const timeout = setTimeout(() => {
                    logInfo('throttleRequest() - free slot', { id });
                    requestThrottleSlots.splice(requestThrottleSlots.indexOf(timeout), 1);
                    const runNext = requestThrottleQueue.shift();
                    if (runNext) runNext();
                }, seconds * 1000);
                requestThrottleSlots.push(timeout);

                logInfo('throttleRequest() - run now', { id });
                resolve();
            };

            if (requestThrottleSlots.length < limit) {
                run();
            } else {
                logInfo('throttleRequest() – add to queue', { id });
                requestThrottleQueue.push(run);
            }
        });
    };
}

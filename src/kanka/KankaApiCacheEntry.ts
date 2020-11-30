import { KankaListResult, KankaResult } from '../types/kanka';

export default class KankaApiCacheEntry<
    T = unknown,
    D = T extends unknown[] ? KankaListResult<T> : KankaResult<T>
> {
    readonly #promise;
    #resolve: (data: D) => void = () => {};
    #reject: (error: Error) => void = () => {};

    constructor() {
        this.#promise = new Promise<D>((resolve, reject) => {
            this.#resolve = resolve;
            this.#reject = reject;
        });
    }

    resolve(data: D): void {
        this.#resolve(data);
    }

    reject(error: Error): void {
        this.#reject(error);
    }

    get data(): Promise<D> {
        return this.#promise;
    }
}

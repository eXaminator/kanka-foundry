type Stats = {
    success: number;
    error: number;
    total: number;
};

export default class StatCollection {
    readonly #stats = new Map<string, Stats>();

    constructor() {
        this.ensureCategory('all');
    }

    private ensureCategory(category: string): void {
        this.#stats.set(category, { success: 0, error: 0, total: 0 });
    }

    private increase(category: string, key: keyof Stats, amount = 1): void {
        const stats = this.#stats.get(category);

        if (stats) {
            stats[key] += amount;
        }
    }

    public addSuccess(category?: string, amount = 1): void {
        if (category) {
            this.ensureCategory(category);
            this.increase(category, 'success', amount);
            this.increase(category, 'total', amount);
        }

        this.increase('all', 'success', amount);
        this.increase('all', 'total', amount);
    }

    public addError(category?: string, amount = 1): void {
        if (category) {
            this.ensureCategory(category);
            this.increase(category, 'error', amount);
            this.increase(category, 'total', amount);
        }

        this.increase('all', 'error', amount);
        this.increase('all', 'total', amount);
    }

    public getStats(category: string): Stats {
        const stats = this.#stats.get(category);

        if (!stats) {
            throw new Error(`No stats for category ${category}`);
        }

        return { ...stats };
    }
}

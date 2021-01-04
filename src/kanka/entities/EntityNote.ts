import { KankaApiEntityNote, KankaVisibility } from '../../types/kanka';

export default class EntityNote {
    readonly #name: string;
    readonly #entry: string;
    readonly #visibility: KankaVisibility;

    constructor(name: string, entry: string, visibility: KankaVisibility) {
        this.#name = name;
        this.#entry = entry;
        this.#visibility = visibility;
    }

    static fromApiData(data: KankaApiEntityNote): EntityNote {
        return new EntityNote(
            data.name,
            data.entry_parsed,
            data.visibility,
        );
    }

    get name(): string {
        return this.#name;
    }

    get entry(): string {
        return this.#entry;
    }

    get visibility(): KankaVisibility {
        return this.#visibility;
    }

    get isSecret(): boolean {
        return this.visibility !== KankaVisibility.all;
    }
}

import { KankaAttribute } from '../types/kanka';

export default class EntityAttribute {
    readonly #name: string;
    readonly #value: string | boolean;
    readonly #type: string;

    constructor(
        name: string,
        value: string,
        type: KankaAttribute['type'],
    ) {
        this.#name = name;
        this.#value = value;
        this.#type = type ?? 'text';

        if (this.isCheckbox()) {
            this.#value = value === '1';
        }
    }

    static fromAttribute(attribute: KankaAttribute): EntityAttribute {
        return new EntityAttribute(attribute.name, attribute.value, attribute.type);
    }

    public get name(): string {
        return this.#name;
    }

    public get value(): string | boolean {
        return this.#value;
    }

    public isCheckbox(): this is this & { value: boolean; } {
        return this.#type === 'checkbox';
    }

    public isText(): this is this & { value: string; } {
        return !this.#type || this.#type === 'text';
    }

    public isSection(): this is this & { value: string; } {
        return this.#type === 'section';
    }
}

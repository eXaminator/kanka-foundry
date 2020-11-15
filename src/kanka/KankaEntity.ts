import { KankaEntityData } from '../types/kanka';
import KankaApi from './KankaApi';

export default abstract class KankaEntity<T extends KankaEntityData = KankaEntityData> {
    constructor(protected api: KankaApi, protected data: T) {}

    public get id(): number {
        return this.data.id;
    }

    abstract get entityType(): string;

    public get entityId(): number {
        return this.data.entity_id;
    }

    public get name(): string {
        return this.data.name;
    }

    public get image(): string | undefined {
        if (this.data.has_custom_image === false) return undefined;
        return this.data.image_full;
    }

    public get entry(): string {
        return this.data.entry_parsed;
    }
}

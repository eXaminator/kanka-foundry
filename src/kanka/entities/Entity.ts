import EntityType from '../../types/EntityType';
import { KankaApiEntity, KankaApiEntityId, KankaApiId } from '../../types/kanka';
import KankaEndpoint from '../KankaEndpoint';
import KankaNode from '../KankaNode';
import type Campaign from './Campaign';
import type PrimaryEntity from './PrimaryEntity';

export default class Entity<T extends PrimaryEntity = PrimaryEntity> extends KankaNode {
    constructor(endpoint: KankaEndpoint, protected data: KankaApiEntity, public campaign: Campaign) {
        super(endpoint);
    }

    get entityType(): EntityType {
        return this.data.type;
    }

    public get id(): KankaApiEntityId {
        return this.data.id;
    }

    public get childId(): KankaApiId {
        return this.data.child_id;
    }

    public get isPrivate(): boolean {
        return this.data.is_private;
    }

    get createdAt(): string {
        return this.data.created_at;
    }

    get updatedAt(): string {
        return this.data.updated_at;
    }

    public get name(): string {
        return this.data.name;
    }

    public get image(): string | undefined {
        if (!this.data.child?.has_custom_image) return undefined;
        return this.data.child?.image_full;
    }

    public get thumbnail(): string | undefined {
        return this.data.child?.image_thumb;
    }

    public async child(): Promise<T | undefined> {
        return this.campaign.getByType(this.entityType)?.byId(this.data.child_id);
    }
}

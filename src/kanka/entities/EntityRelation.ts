import { KankaApiEntityId, KankaApiRelation, KankaVisibility } from '../../types/kanka';
import KankaEntityCollection from '../KankaEntityCollection';
import Entity from './Entity';
import type PrimaryEntity from './PrimaryEntity';

export default class EntityRelation<T extends PrimaryEntity = PrimaryEntity> {
    constructor(
        public readonly relation: string | undefined,
        public readonly attitude: number | undefined,
        public readonly color: string | undefined,
        public readonly visibility: KankaVisibility,
        public readonly isStarred: boolean,
        private readonly targetId: KankaApiEntityId | undefined,
        private readonly entityCollection: KankaEntityCollection,
    ) {}

    static fromApiData<T extends PrimaryEntity>(
        data: KankaApiRelation,
        entityCollection: KankaEntityCollection,
    ): EntityRelation<T> {
        return new EntityRelation(
            data.relation,
            data.attitude,
            data.colour,
            data.visibility,
            data.is_star,
            data.target_id,
            entityCollection,
        );
    }

    public get isPublic(): boolean {
        return this.visibility === KankaVisibility.all;
    }

    async target(): Promise<Entity<T> | undefined> {
        if (!this.targetId) return undefined;
        return this.entityCollection.byId<T>(this.targetId);
    }
}

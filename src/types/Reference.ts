import { KankaApiEntityId, KankaApiEntityType, KankaApiId } from './kanka';

export default interface Reference {
    name: string;
    entityId: KankaApiEntityId;
    id: KankaApiId;
    type: KankaApiEntityType,
    image: string | undefined;
    thumb: string | undefined;
    isPrivate: boolean;
}

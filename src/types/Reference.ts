import type { KankaApiEntityId, KankaApiModuleType, KankaApiId } from './kanka';

export default interface Reference {
    name: string;
    entityId: KankaApiEntityId;
    id: KankaApiId;
    type: KankaApiModuleType;
    image: string | undefined;
    thumb: string | undefined;
    isPrivate: boolean;
    urls: {
        view: string;
        api: string;
    };
    link?: string;
}

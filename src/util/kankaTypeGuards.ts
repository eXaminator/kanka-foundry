import type { KankaApiCharacter, KankaApiChildEntity, KankaApiChildEntityWithChildren, KankaApiEntityType, KankaApiFamily, KankaApiOrganisation, KankaApiQuest } from "../types/kanka";

export function isCharacter(entity: KankaApiChildEntity, type: KankaApiEntityType): entity is KankaApiCharacter {
    return type === 'character';
}

export function isFamily(entity: KankaApiChildEntity, type: KankaApiEntityType): entity is KankaApiFamily {
    return type === 'family';
}

export function isOrganisation(entity: KankaApiChildEntity, type: KankaApiEntityType): entity is KankaApiOrganisation {
    return type === 'organisation';
}

export function isQuest(entity: KankaApiChildEntity, type: KankaApiEntityType): entity is KankaApiQuest {
    return type === 'quest';
}

export function hasChildren(entity: KankaApiChildEntity, type: KankaApiEntityType): entity is KankaApiChildEntityWithChildren {
    return (entity as KankaApiChildEntityWithChildren).children !== undefined;
}
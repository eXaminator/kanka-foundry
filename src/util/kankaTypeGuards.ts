import type { KankaApiCharacter, KankaApiChildEntity, KankaApiChildEntityWithChildren, KankaApiModuleType, KankaApiFamily, KankaApiOrganisation, KankaApiQuest } from "../types/kanka";

export function isCharacter(entity: KankaApiChildEntity, type: KankaApiModuleType): entity is KankaApiCharacter {
    return type === 'character';
}

export function isFamily(entity: KankaApiChildEntity, type: KankaApiModuleType): entity is KankaApiFamily {
    return type === 'family';
}

export function isOrganisation(entity: KankaApiChildEntity, type: KankaApiModuleType): entity is KankaApiOrganisation {
    return type === 'organisation';
}

export function isQuest(entity: KankaApiChildEntity, type: KankaApiModuleType): entity is KankaApiQuest {
    return type === 'quest';
}

export function hasChildren(entity: KankaApiChildEntity, type: KankaApiModuleType): entity is KankaApiChildEntityWithChildren {
    return (entity as KankaApiChildEntityWithChildren).children !== undefined;
}

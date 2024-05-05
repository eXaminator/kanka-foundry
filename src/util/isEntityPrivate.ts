import type Reference from '../types/Reference';
import {
    type AnyConstrainable,
    type KankaApiSimpleConstrainable,
    type KankaApiVisibilityConstrainable,
    KankaVisibility,
} from '../types/kanka';

function hasVisibility(entity: unknown): entity is KankaApiVisibilityConstrainable {
    return (entity as KankaApiVisibilityConstrainable)?.visibility_id !== undefined;
}

function hasIsPrivate(entity: unknown): entity is KankaApiSimpleConstrainable {
    return (entity as KankaApiSimpleConstrainable)?.is_private !== undefined;
}

function isReference(entity: unknown): entity is Reference {
    return (entity as Reference)?.isPrivate !== undefined;
}

export default function isEntityPrivate(entity: AnyConstrainable | Reference): boolean {
    if (hasVisibility(entity)) {
        return ![KankaVisibility.all, KankaVisibility.members].includes(entity.visibility_id);
    }

    if (hasIsPrivate(entity)) {
        return entity.is_private;
    }

    if (isReference(entity)) {
        return entity.isPrivate;
    }

    return false;
}

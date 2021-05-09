import { KankaApiSimpleConstrainable, KankaApiVisibilityConstrainable } from '../../types/kanka';
import Reference from '../../types/Reference';

function hasVisibility(entity: unknown): entity is KankaApiVisibilityConstrainable {
    return (entity as KankaApiVisibilityConstrainable)?.visibility !== undefined;
}

function hasIsPrivate(entity: unknown): entity is KankaApiSimpleConstrainable {
    return (entity as KankaApiSimpleConstrainable)?.is_private !== undefined;
}

function isReference(entity: unknown): entity is Reference {
    return (entity as Reference)?.isPrivate !== undefined;
}

export default function kankaIsSecret(entity: unknown): boolean {
    if (hasVisibility(entity)) {
        return !['all', 'members'].includes(entity.visibility);
    }

    if (hasIsPrivate(entity)) {
        return entity.is_private;
    }

    if (isReference(entity)) {
        return entity.isPrivate;
    }

    return false;
}

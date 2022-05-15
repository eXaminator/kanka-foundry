import { KankaApiSimpleConstrainable, KankaApiVisibilityConstrainable, KankaVisibility, LegacyKankaApiVisibilityConstrainable, LegacyKankaVisibility } from '../../types/kanka';
import Reference from '../../types/Reference';

function hasVisibility(entity: unknown): entity is KankaApiVisibilityConstrainable {
    return (entity as KankaApiVisibilityConstrainable)?.visibility_id !== undefined;
}

function hasLegacyVisibility(entity: unknown): entity is LegacyKankaApiVisibilityConstrainable {
    return (entity as LegacyKankaApiVisibilityConstrainable)?.visibility !== undefined;
}

function hasIsPrivate(entity: unknown): entity is KankaApiSimpleConstrainable {
    return (entity as KankaApiSimpleConstrainable)?.is_private !== undefined;
}

function isReference(entity: unknown): entity is Reference {
    return (entity as Reference)?.isPrivate !== undefined;
}

export default function kankaIsSecret(...args: [...unknown[], Handlebars.HelperOptions]): boolean {
    args.pop(); // Remove options

    return args.some((entity) => {
        if (hasVisibility(entity)) {
            return ![KankaVisibility.all, KankaVisibility.members].includes(entity.visibility_id);
        }

        if (hasLegacyVisibility(entity)) {
            return ![LegacyKankaVisibility.all, LegacyKankaVisibility.members].includes(entity.visibility);
        }

        if (hasIsPrivate(entity)) {
            return entity.is_private;
        }

        if (isReference(entity)) {
            return entity.isPrivate;
        }

        return false;
    });
}

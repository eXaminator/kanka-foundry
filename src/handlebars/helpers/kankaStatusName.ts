import localization from '../../state/localization';
import type { KankaApiEntityStatus } from '../../types/kanka';

export default function kankaStatusName(status: KankaApiEntityStatus | null | undefined): string {
    if (!status) return '';

    const key = `KANKA.journal.shared.status.${status.key}`;
    if (!status.is_custom && localization.has(key)) {
        return localization.localize(key);
    }

    return status.name ?? status.key;
}

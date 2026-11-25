type Pinnable = { is_pinned?: boolean; is_star?: boolean };

/**
 * Returns all pinned entries. Kanka renamed `is_star` to `is_pinned`, older snapshots only contain `is_star`.
 */
export default function kankaFilterPinned<T extends Pinnable>(data: T[] | null | undefined): T[] {
    if (!Array.isArray(data)) return [];

    return data.filter((entry) => entry.is_pinned ?? entry.is_star ?? false);
}

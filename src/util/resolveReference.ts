import type { KankaApiAnyId } from "../types/kanka";
import type Reference from "../types/Reference";

export default function resolveReference(id: KankaApiAnyId, type: string | undefined, references: Record<number, Reference>): Reference | undefined {
    return Object
        .values(references)
        .find((ref) => (ref.type === type && ref.id === id) || (!type && ref.entityId === id));
}

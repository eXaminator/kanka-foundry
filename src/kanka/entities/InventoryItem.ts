import { KankaInventory, Visibility } from '../../types/kanka';
import EntityBase from './EntityBase';
import type Item from './Item';
import type PrimaryEntity from './PrimaryEntity';

export default class InventoryItem extends EntityBase<KankaInventory, PrimaryEntity> {
    get name(): string | undefined {
        return this.data.name;
    }

    get position(): string | undefined {
        return this.data.position;
    }

    get description(): string | undefined {
        return this.data.description;
    }

    get amount(): number | undefined {
        return this.data.amount;
    }

    get isEquipped(): boolean {
        return this.data.is_equipped;
    }

    get visibility(): Visibility {
        return this.data.visibility;
    }

    async item(): Promise<Item | undefined> {
        if (!this.data.item_id) return undefined;
        return this.findReference(this.parent.parent.items(), this.data.item_id);
    }
}

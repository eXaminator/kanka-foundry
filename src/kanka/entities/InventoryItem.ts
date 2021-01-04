import { KankaApiId, KankaApiInventory, KankaVisibility } from '../../types/kanka';
import KankaNodeCollection from '../KankaNodeCollection';
import type Item from './Item';

export default class InventoryItem {
    #name: string | undefined;
    #position: string | undefined;
    #description: string | undefined;
    #amount: number | undefined;
    #isEquipped: boolean;
    #visibility: KankaVisibility;
    #itemId: KankaApiId | undefined;
    #itemCollection: KankaNodeCollection<Item>;

    constructor(
        name: string | undefined,
        position: string | undefined,
        description: string | undefined,
        amount: number | undefined,
        isEquipped: boolean,
        visibility: KankaVisibility,
        itemId: KankaApiId | undefined,
        itemCollection: KankaNodeCollection<Item>,
    ) {
        this.#name = name;
        this.#position = position;
        this.#description = description;
        this.#amount = amount;
        this.#isEquipped = isEquipped;
        this.#visibility = visibility ?? KankaVisibility.all;
        this.#itemId = itemId;
        this.#itemCollection = itemCollection;
    }

    static fromApiData(data: KankaApiInventory, itemCollection: KankaNodeCollection<Item>): InventoryItem {
        return new InventoryItem(
            data.name,
            data.position,
            data.description,
            data.amount,
            data.is_equipped,
            data.visibility,
            data.item_id,
            itemCollection,
        );
    }

    get name(): string | undefined {
        return this.#name;
    }

    get position(): string | undefined {
        return this.#position;
    }

    get description(): string | undefined {
        return this.#description;
    }

    get amount(): number | undefined {
        return this.#amount;
    }

    get isEquipped(): boolean {
        return this.#isEquipped;
    }

    get visibility(): KankaVisibility {
        return this.#visibility;
    }

    async item(): Promise<Item | undefined> {
        if (!this.#itemId) return undefined;
        return this.#itemCollection.byId(this.#itemId);
    }
}

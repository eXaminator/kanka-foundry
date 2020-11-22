import EntityType from '../../types/EntityType';
import { ItemData } from '../../types/kanka';
import type Campaign from './Campaign';
import PrimaryEntity from './PrimaryEntity';

export default class Item extends PrimaryEntity<ItemData, Campaign> {
    get entityType(): EntityType {
        return EntityType.item;
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    public get price(): string | undefined {
        return this.data.price;
    }

    public get size(): string | undefined {
        return this.data.size;
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
        this.addMetaData({ label: 'price', value: this.price });
        this.addMetaData({ label: 'size', value: this.size });
    }
}

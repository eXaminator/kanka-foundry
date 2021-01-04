import EntityType from '../../types/EntityType';
import { KankaApiItem } from '../../types/kanka';
import Character from './Character';
import Location from './Location';
import PrimaryEntity from './PrimaryEntity';

export default class Item extends PrimaryEntity<KankaApiItem> {
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

    public async location(): Promise<Location | undefined> {
        if (!this.data.location_id) return undefined;
        return this.campaign.locations().byId(this.data.location_id);
    }

    public async character(): Promise<Character | undefined> {
        if (!this.data.character_id) return undefined;
        return this.campaign.characters().byId(this.data.character_id);
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
        this.addMetaData({ label: 'price', value: this.price });
        this.addMetaData({ label: 'size', value: this.size });
        await Promise.all([
            this.addReferenceMetaData('character', this.character()),
            this.addReferenceMetaData('location', this.location()),
        ]);
    }
}

import EntityType from '../../types/EntityType';
import { LocationData } from '../../types/kanka';
import type Campaign from './Campaign';
import PrimaryEntity from './PrimaryEntity';

export default class Location extends PrimaryEntity<LocationData, Campaign> {
    get entityType(): EntityType {
        return EntityType.location;
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    get treeParentId(): number | undefined {
        return this.data.parent_location_id;
    }

    async treeParent(): Promise<Location | undefined> {
        return this.findReference(this.parent.locations(), this.treeParentId);
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
    }
}

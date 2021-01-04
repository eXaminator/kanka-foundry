import EntityType from '../../types/EntityType';
import { KankaApiId, KankaApiLocation } from '../../types/kanka';
import PrimaryEntity from './PrimaryEntity';

export default class Location extends PrimaryEntity<KankaApiLocation> {
    get entityType(): EntityType {
        return EntityType.location;
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    get treeParentId(): KankaApiId | undefined {
        return this.data.parent_location_id;
    }

    async treeParent(): Promise<Location | undefined> {
        if (!this.treeParentId) return undefined;
        return this.campaign.locations().byId(this.treeParentId);
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
    }
}

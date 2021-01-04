import EntityType from '../../types/EntityType';
import { KankaApiFamily, KankaApiId } from '../../types/kanka';
import Location from './Location';
import PrimaryEntity from './PrimaryEntity';

export default class Family extends PrimaryEntity<KankaApiFamily> {
    get entityType(): EntityType {
        return EntityType.family;
    }

    get treeParentId(): KankaApiId | undefined {
        return this.data.family_id;
    }

    async treeParent(): Promise<Family | undefined> {
        if (!this.treeParentId) return undefined;
        return this.campaign.families().byId(this.treeParentId);
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    public async location(): Promise<Location | undefined> {
        if (!this.data.location_id) return undefined;
        return this.campaign.locations().byId(this.data.location_id);
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
        await Promise.all([
            this.addReferenceMetaData('location', this.location()),
        ]);
    }
}

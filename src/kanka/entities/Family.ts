import EntityType from '../../types/EntityType';
import { FamilyData } from '../../types/kanka';
import type Campaign from './Campaign';
import Location from './Location';
import PrimaryEntity from './PrimaryEntity';

export default class Family extends PrimaryEntity<FamilyData, Campaign> {
    get entityType(): EntityType {
        return EntityType.family;
    }

    get treeParentId(): number | undefined {
        return this.data.family_id;
    }

    async treeParent(): Promise<Family | undefined> {
        return this.findReference(this.parent.families(), this.treeParentId);
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    public async location(): Promise<Location | undefined> {
        return this.findReference(this.parent.locations(), this.data.location_id);
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
        await Promise.all([
            this.addReferenceMetaData('location', this.location()),
        ]);
    }
}

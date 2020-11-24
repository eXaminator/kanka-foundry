import EntityType from '../../types/EntityType';
import { OrganisationData } from '../../types/kanka';
import type Campaign from './Campaign';
import Location from './Location';
import PrimaryEntity from './PrimaryEntity';

export default class Organisation extends PrimaryEntity<OrganisationData, Campaign> {
    get entityType(): EntityType {
        return EntityType.organisation;
    }

    get treeParentId(): number | undefined {
        return this.data.organisation_id;
    }

    async treeParent(): Promise<Organisation | undefined> {
        return this.findReference(this.parent.organisations(), this.treeParentId);
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

import EntityType from '../../types/EntityType';
import { KankaApiId, KankaApiOrganisation } from '../../types/kanka';
import Location from './Location';
import PrimaryEntity from './PrimaryEntity';

export default class Organisation extends PrimaryEntity<KankaApiOrganisation> {
    get entityType(): EntityType {
        return EntityType.organisation;
    }

    get treeParentId(): KankaApiId | undefined {
        return this.data.organisation_id;
    }

    async treeParent(): Promise<Organisation | undefined> {
        if (!this.treeParentId) return undefined;
        return this.campaign.organisations().byId(this.treeParentId);
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

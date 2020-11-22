import EntityType from '../../types/EntityType';
import { OrganisationData } from '../../types/kanka';
import type Campaign from './Campaign';
import PrimaryEntity from './PrimaryEntity';

export default class Organisation extends PrimaryEntity<OrganisationData, Campaign> {
    get entityType(): EntityType {
        return EntityType.organisation;
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
    }
}

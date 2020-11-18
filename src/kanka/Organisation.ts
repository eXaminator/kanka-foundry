import EntityType from '../types/EntityType';
import { OrganisationData } from '../types/kanka';
import KankaEntity from './KankaEntity';

export default class Organisation extends KankaEntity<OrganisationData> {
    get entityType(): EntityType {
        return EntityType.organisation;
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    protected buildMetaData(): void {
        super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
    }
}

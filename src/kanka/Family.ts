import EntityType from '../types/EntityType';
import { FamilyData } from '../types/kanka';
import KankaEntity from './KankaEntity';

export default class Family extends KankaEntity<FamilyData> {
    get entityType(): EntityType {
        return EntityType.family;
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
    }
}

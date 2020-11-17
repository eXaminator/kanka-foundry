import { FamilyData } from '../types/kanka';
import KankaEntity from './KankaEntity';

export default class Family extends KankaEntity<FamilyData> {
    get entityType(): string {
        return 'family';
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    protected buildMetaData(): void {
        super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
    }
}

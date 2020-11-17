import { LocationData } from '../types/kanka';
import KankaEntity from './KankaEntity';

export default class Organisation extends KankaEntity<LocationData> {
    get entityType(): string {
        return 'organisation';
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    protected buildMetaData(): void {
        super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
    }
}

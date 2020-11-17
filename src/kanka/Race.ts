import { RaceData } from '../types/kanka';
import KankaEntity from './KankaEntity';

export default class Race extends KankaEntity<RaceData> {
    get entityType(): string {
        return 'race';
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    protected buildMetaData(): void {
        super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
    }
}

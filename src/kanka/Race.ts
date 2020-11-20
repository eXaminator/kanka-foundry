import EntityType from '../types/EntityType';
import { RaceData } from '../types/kanka';
import KankaEntity from './KankaEntity';

export default class Race extends KankaEntity<RaceData> {
    get entityType(): EntityType {
        return EntityType.race;
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
    }
}

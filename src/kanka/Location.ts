import EntityType from '../types/EntityType';
import { LocationData } from '../types/kanka';
import KankaEntity from './KankaEntity';

export default class Location extends KankaEntity<LocationData> {
    get entityType(): EntityType {
        return EntityType.location;
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
    }
}

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

    protected buildMetaData(): void {
        super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
    }
}

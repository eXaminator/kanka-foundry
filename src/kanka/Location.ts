import { LocationData } from '../types/kanka';
import KankaEntity from './KankaEntity';

export default class Location extends KankaEntity<LocationData> {
    get entityType(): string {
        return 'location';
    }

    public get type(): string {
        return this.data.type;
    }

    public get metaData(): Record<string, string> {
        return {
            type: this.type,
        };
    }
}

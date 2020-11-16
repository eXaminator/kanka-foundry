import { LocationData } from '../types/kanka';
import KankaEntity from './KankaEntity';

export default class Organisation extends KankaEntity<LocationData> {
    get entityType(): string {
        return 'organisation';
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    public get metaData(): Record<string, unknown> {
        return {
            type: this.type,
        };
    }
}

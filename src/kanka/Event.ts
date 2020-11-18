import EntityType from '../types/EntityType';
import { EventData } from '../types/kanka';
import KankaEntity from './KankaEntity';

export default class Event extends KankaEntity<EventData> {
    get entityType(): EntityType {
        return EntityType.event;
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    public get date(): string | undefined {
        return this.data.date;
    }

    protected buildMetaData(): void {
        super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
        this.addMetaData({ label: 'date', value: this.date });
    }
}

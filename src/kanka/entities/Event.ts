import EntityType from '../../types/EntityType';
import { EventData } from '../../types/kanka';
import type Campaign from './Campaign';
import Location from './Location';
import PrimaryEntity from './PrimaryEntity';

export default class Event extends PrimaryEntity<EventData, Campaign> {
    get entityType(): EntityType {
        return EntityType.event;
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    public get date(): string | undefined {
        return this.data.date;
    }

    public async location(): Promise<Location | undefined> {
        return this.findReference(this.parent.locations(), this.data.location_id);
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
        this.addMetaData({ label: 'date', value: this.date });
        await Promise.all([
            this.addReferenceMetaData('location', this.location()),
        ]);
    }
}

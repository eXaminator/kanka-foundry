import EntityType from '../../types/EntityType';
import { KankaApiEvent } from '../../types/kanka';
import Location from './Location';
import PrimaryEntity from './PrimaryEntity';

export default class Event extends PrimaryEntity<KankaApiEvent> {
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
        if (!this.data.location_id) return undefined;
        return this.campaign.locations().byId(this.data.location_id);
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

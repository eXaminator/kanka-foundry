import EntityType from '../../types/EntityType';
import { JournalData } from '../../types/kanka';
import type Campaign from './Campaign';
import Character from './Character';
import Location from './Location';
import PrimaryEntity from './PrimaryEntity';

export default class Journal extends PrimaryEntity<JournalData, Campaign> {
    get entityType(): EntityType {
        return EntityType.journal;
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

    public async character(): Promise<Character | undefined> {
        return this.findReference(this.parent.characters(), this.data.character_id);
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
        this.addMetaData({ label: 'date', value: this.date });
        await Promise.all([
            this.addReferenceMetaData('author', this.character()),
            this.addReferenceMetaData('location', this.location()),
        ]);
    }
}

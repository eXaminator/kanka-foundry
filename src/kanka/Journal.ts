import EntityType from '../types/EntityType';
import { JournalData } from '../types/kanka';
import KankaEntity from './KankaEntity';

export default class Journal extends KankaEntity<JournalData> {
    get entityType(): EntityType {
        return EntityType.journal;
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    public get date(): string | undefined {
        return this.data.date;
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
        this.addMetaData({ label: 'date', value: this.date });
    }
}

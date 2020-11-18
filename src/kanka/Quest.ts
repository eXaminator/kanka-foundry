import EntityType from '../types/EntityType';
import { QuestData } from '../types/kanka';
import KankaEntity from './KankaEntity';

export default class Quest extends KankaEntity<QuestData> {
    get entityType(): EntityType {
        return EntityType.journal;
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    public get date(): string | undefined {
        return this.data.date;
    }

    public get isCompleted(): boolean {
        return this.data.is_completed;
    }

    protected buildMetaData(): void {
        super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
        this.addMetaData({ label: 'date', value: this.date });
        this.addMetaData({ label: 'isCompleted', value: this.isCompleted });
    }
}

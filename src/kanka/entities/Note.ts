import EntityType from '../../types/EntityType';
import { NoteData } from '../../types/kanka';
import type Campaign from './Campaign';
import PrimaryEntity from './PrimaryEntity';

export default class Note extends PrimaryEntity<NoteData, Campaign> {
    get entityType(): EntityType {
        return EntityType.note;
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
    }
}

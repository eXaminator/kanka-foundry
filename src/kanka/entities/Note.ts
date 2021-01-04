import EntityType from '../../types/EntityType';
import { KankaApiId, KankaApiNote } from '../../types/kanka';
import PrimaryEntity from './PrimaryEntity';

export default class Note extends PrimaryEntity<KankaApiNote> {
    get entityType(): EntityType {
        return EntityType.note;
    }

    get treeParentId(): KankaApiId | undefined {
        return this.data.note_id;
    }

    async treeParent(): Promise<Note | undefined> {
        if (!this.treeParentId) return undefined;
        return this.campaign.notes().byId(this.treeParentId);
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
    }
}

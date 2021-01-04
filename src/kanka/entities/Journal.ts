import EntityType from '../../types/EntityType';
import { KankaApiId, KankaApiJournal } from '../../types/kanka';
import Character from './Character';
import Location from './Location';
import PrimaryEntity from './PrimaryEntity';

export default class Journal extends PrimaryEntity<KankaApiJournal> {
    get entityType(): EntityType {
        return EntityType.journal;
    }

    get treeParentId(): KankaApiId | undefined {
        return this.data.journal_id;
    }

    async treeParent(): Promise<Journal | undefined> {
        if (!this.treeParentId) return undefined;
        return this.campaign.journals().byId(this.treeParentId);
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

    public async character(): Promise<Character | undefined> {
        if (!this.data.character_id) return undefined;
        return this.campaign.characters().byId(this.data.character_id);
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

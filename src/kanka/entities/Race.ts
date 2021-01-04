import EntityType from '../../types/EntityType';
import { KankaApiId, KankaApiRace } from '../../types/kanka';
import PrimaryEntity from './PrimaryEntity';

export default class Race extends PrimaryEntity<KankaApiRace> {
    get entityType(): EntityType {
        return EntityType.race;
    }

    get treeParentId(): KankaApiId | undefined {
        return this.data.race_id;
    }

    async treeParent(): Promise<Race | undefined> {
        if (!this.treeParentId) return undefined;
        return this.campaign.races().byId(this.treeParentId);
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
    }
}

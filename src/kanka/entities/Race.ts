import EntityType from '../../types/EntityType';
import { RaceData } from '../../types/kanka';
import type Campaign from './Campaign';
import PrimaryEntity from './PrimaryEntity';

export default class Race extends PrimaryEntity<RaceData, Campaign> {
    get entityType(): EntityType {
        return EntityType.race;
    }

    get treeParentId(): number | undefined {
        return this.data.race_id;
    }

    async treeParent(): Promise<Race | undefined> {
        return this.findReference(this.parent.races(), this.treeParentId);
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
    }
}

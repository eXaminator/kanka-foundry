import EntityType from '../../types/EntityType';
import { AbilityData } from '../../types/kanka';
import type Campaign from './Campaign';
import PrimaryEntity from './PrimaryEntity';

export default class Ability extends PrimaryEntity<AbilityData, Campaign> {
    get entityType(): EntityType {
        return EntityType.ability;
    }

    get treeParentId(): number | undefined {
        return this.data.ability_id;
    }

    async treeParent(): Promise<Ability | undefined> {
        return this.findReference(this.parent.abilities(), this.treeParentId);
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    public get charges(): string | undefined {
        return this.data.charges;
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
        this.addMetaData({ label: 'charges', value: this.charges });
    }
}

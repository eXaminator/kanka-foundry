import EntityType from '../../types/EntityType';
import { KankaApiAbility, KankaApiId } from '../../types/kanka';
import PrimaryEntity from './PrimaryEntity';

export default class Ability extends PrimaryEntity<KankaApiAbility> {
    get entityType(): EntityType {
        return EntityType.ability;
    }

    get treeParentId(): KankaApiId | undefined {
        return this.data.ability_id;
    }

    async treeParent(): Promise<Ability | undefined> {
        if (!this.treeParentId) return undefined;
        return this.campaign.abilities().byId(this.treeParentId);
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

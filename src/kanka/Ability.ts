import EntityType from '../types/EntityType';
import { AbilityData } from '../types/kanka';
import KankaEntity from './KankaEntity';

export default class Ability extends KankaEntity<AbilityData> {
    get entityType(): EntityType {
        return EntityType.ability;
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    public get charges(): string | undefined {
        return this.data.charges;
    }

    protected buildMetaData(): void {
        super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
        this.addMetaData({ label: 'charges', value: this.charges });
    }
}

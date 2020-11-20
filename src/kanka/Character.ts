import EntityType from '../types/EntityType';
import { CharacterData } from '../types/kanka';
import { MetaDataType } from '../types/KankaSettings';
import KankaEntity from './KankaEntity';

export default class Character extends KankaEntity<CharacterData> {
    get entityType(): EntityType {
        return EntityType.character;
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    public get age(): string | undefined {
        return this.data.age;
    }

    public get isDead(): boolean {
        return this.data.is_dead;
    }

    public get sex(): string | undefined {
        return this.data.sex;
    }

    public get title(): string | undefined {
        return this.data.title;
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
        this.addMetaData({ label: 'title', value: this.title });
        this.addMetaData({ label: 'sex', value: this.sex });
        this.addMetaData({ label: 'age', value: this.age });
        this.addMetaData({ label: 'isDead', value: this.isDead });

        this.data.traits.forEach(trait => this.addMetaData({
            originalData: trait,
            section: trait.section,
            type: MetaDataType.characterTrait,
            label: trait.name,
            value: trait.entry,
        }));
    }
}

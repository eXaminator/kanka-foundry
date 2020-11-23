import EntityType from '../../types/EntityType';
import { CharacterData } from '../../types/kanka';
import { MetaDataType } from '../../types/KankaSettings';
import type Campaign from './Campaign';
import Family from './Family';
import Location from './Location';
import PrimaryEntity from './PrimaryEntity';
import Race from './Race';

export default class Character extends PrimaryEntity<CharacterData, Campaign> {
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

    public async location(): Promise<Location | undefined> {
        return this.findReference(this.parent.locations(), this.data.location_id);
    }

    public async race(): Promise<Race | undefined> {
        return this.findReference(this.parent.races(), this.data.race_id);
    }

    public async family(): Promise<Family | undefined> {
        return this.findReference(this.parent.families(), this.data.family_id);
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();

        this.addMetaData({ label: 'type', value: this.type });
        this.addMetaData({ label: 'title', value: this.title });
        this.addMetaData({ label: 'sex', value: this.sex });
        this.addMetaData({ label: 'age', value: this.age });
        this.addMetaData({ label: 'isDead', value: this.isDead });

        await Promise.all([
            this.addReferenceMetaData('race', this.race()),
            this.addReferenceMetaData('family', this.family()),
            this.addReferenceMetaData('location', this.location()),
        ]);

        this.data.traits.forEach(trait => this.addMetaData({
            originalData: trait,
            section: trait.section,
            type: MetaDataType.characterTrait,
            label: trait.name,
            value: trait.entry,
        }));
    }
}

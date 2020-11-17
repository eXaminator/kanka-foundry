import { CharacterData } from '../types/kanka';
import KankaEntity from './KankaEntity';

export default class Character extends KankaEntity<CharacterData> {
    get entityType(): string {
        return 'character';
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

    protected buildMetaData(): void {
        super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
        this.addMetaData({ label: 'title', value: this.title });
        this.addMetaData({ label: 'sex', value: this.sex });
        this.addMetaData({ label: 'age', value: this.age });
        this.addMetaData({ label: 'isDead', value: this.isDead });
    }
}

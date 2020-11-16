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

    public get metaData(): Record<string, unknown> {
        return {
            type: this.type,
            title: this.title,
            sex: this.sex,
            age: this.age,
            isDead: this.isDead ? true : undefined,
        };
    }
}

import { KankaEntityNote, Visibility } from '../../types/kanka';
import EntityBase from './EntityBase';
import type PrimaryEntity from './PrimaryEntity';

export default class EntityNote extends EntityBase<KankaEntityNote, PrimaryEntity> {
    get name(): string {
        return this.data.name;
    }

    get entry(): string {
        return this.data.entry;
    }

    get visibility(): Visibility {
        return this.data.visibility;
    }

    get isSecret(): boolean {
        return this.visibility !== Visibility.all;
    }
}

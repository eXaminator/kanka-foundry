import { NoteData } from '../types/kanka';
import KankaEntity from './KankaEntity';

export default class Note extends KankaEntity<NoteData> {
    get entityType(): string {
        return 'note';
    }
}

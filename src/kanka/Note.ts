import EntityType from '../types/EntityType';
import { NoteData } from '../types/kanka';
import KankaEntity from './KankaEntity';

export default class Note extends KankaEntity<NoteData> {
    get entityType(): EntityType {
        return EntityType.note;
    }
}

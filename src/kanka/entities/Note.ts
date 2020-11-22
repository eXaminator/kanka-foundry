import EntityType from '../../types/EntityType';
import { NoteData } from '../../types/kanka';
import type Campaign from './Campaign';
import PrimaryEntity from './PrimaryEntity';

export default class Note extends PrimaryEntity<NoteData, Campaign> {
    get entityType(): EntityType {
        return EntityType.note;
    }
}

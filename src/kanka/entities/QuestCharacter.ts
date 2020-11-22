import { QuestCharacterData } from '../../types/kanka';
import Character from './Character';
import QuestReference from './QuestReference';

export default class QuestCharacter extends QuestReference<Character, QuestCharacterData> {
    protected async loadReference(): Promise<Character> {
        return this.parent.parent.characters().byId(this.data.character_id);
    }
}

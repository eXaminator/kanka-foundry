import { KankaApiQuestCharacterReference } from '../../types/kanka';
import Character from './Character';
import QuestReference from './QuestReference';

export default class QuestCharacter extends QuestReference<Character, KankaApiQuestCharacterReference> {
    protected async loadReference(): Promise<Character> {
        return this.campaign.characters().byId(this.data.character_id);
    }
}

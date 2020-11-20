import { CharacterData, QuestCharacterData } from '../types/kanka';
import Character from './Character';
import QuestReference from './QuestReference';

export default class QuestCharacter extends QuestReference<Character, QuestCharacterData> {
    protected async loadReference(): Promise<Character> {
        const childApi = this.api.withPath<CharacterData>(`../../../../characters/${Number(this.data.character_id)}`);
        const { data } = await childApi.load();
        return new Character(childApi, data);
    }
}

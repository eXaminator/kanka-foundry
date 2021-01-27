import { KankaApiQuestItemReference } from '../../types/kanka';
import Item from './Item';
import QuestReference from './QuestReference';

export default class QuestItem extends QuestReference<Item, KankaApiQuestItemReference> {
    protected async loadReference(): Promise<Item | undefined> {
        return this.campaign.items().byId(this.data.item_id);
    }
}

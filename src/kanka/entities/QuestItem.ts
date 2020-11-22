import { QuestItemData } from '../../types/kanka';
import Item from './Item';
import QuestReference from './QuestReference';

export default class QuestItem extends QuestReference<Item, QuestItemData> {
    protected async loadReference(): Promise<Item> {
        return this.parent.parent.items().byId(this.data.item_id);
    }
}

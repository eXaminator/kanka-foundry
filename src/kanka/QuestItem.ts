import { ItemData, QuestItemData } from '../types/kanka';
import Item from './Item';
import QuestReference from './QuestReference';

export default class QuestItem extends QuestReference<Item, QuestItemData> {
    protected async loadReference(): Promise<Item> {
        const childApi = this.api.withPath<ItemData>(`../../../../items/${Number(this.data.item_id)}`);
        const { data } = await childApi.load();
        return new Item(childApi, data);
    }
}

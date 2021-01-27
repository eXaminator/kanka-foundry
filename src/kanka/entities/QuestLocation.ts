import { KankaApiQuestLocationReference } from '../../types/kanka';
import type Location from './Location';
import QuestReference from './QuestReference';

export default class QuestLocation extends QuestReference<Location, KankaApiQuestLocationReference> {
    protected async loadReference(): Promise<Location | undefined> {
        return this.campaign.locations().byId(this.data.location_id);
    }
}

import { QuestLocationData } from '../../types/kanka';
import type Location from './Location';
import QuestReference from './QuestReference';

export default class QuestLocation extends QuestReference<Location, QuestLocationData> {
    protected async loadReference(): Promise<Location> {
        return this.parent.parent.locations().byId(this.data.location_id);
    }
}

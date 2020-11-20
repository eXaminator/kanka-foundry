import { LocationData, QuestLocationData } from '../types/kanka';
import Location from './Location';
import QuestReference from './QuestReference';

export default class QuestLocation extends QuestReference<Location, QuestLocationData> {
    protected async loadReference(): Promise<Location> {
        const childApi = this.api.withPath<LocationData>(`../../../../locations/${Number(this.data.location_id)}`);
        const { data } = await childApi.load();
        return new Location(childApi, data);
    }
}

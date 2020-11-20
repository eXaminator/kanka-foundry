import { OrganisationData, QuestOrganisationData } from '../types/kanka';
import Organisation from './Organisation';
import QuestReference from './QuestReference';

export default class QuestOrganisation extends QuestReference<Organisation, QuestOrganisationData> {
    protected async loadReference(): Promise<Organisation> {
        const childApi = this.api.withPath<OrganisationData>(`../../../../organisations/${Number(this.data.organisation_id)}`);
        const { data } = await childApi.load();
        return new Organisation(childApi, data);
    }
}

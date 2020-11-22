import { QuestOrganisationData } from '../../types/kanka';
import Organisation from './Organisation';
import QuestReference from './QuestReference';

export default class QuestOrganisation extends QuestReference<Organisation, QuestOrganisationData> {
    protected async loadReference(): Promise<Organisation> {
        return this.parent.parent.organisations().byId(this.data.organisation_id);
    }
}

import { KankaApiQuestOrganisationReference } from '../../types/kanka';
import Organisation from './Organisation';
import QuestReference from './QuestReference';

export default class QuestOrganisation extends QuestReference<Organisation, KankaApiQuestOrganisationReference> {
    protected async loadReference(): Promise<Organisation | undefined> {
        return this.campaign.organisations().byId(this.data.organisation_id);
    }
}

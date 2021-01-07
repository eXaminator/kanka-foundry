import { KankaApiCharacterOrganisationLink, KankaApiId } from '../../types/kanka';
import KankaNodeCollection from '../KankaNodeCollection';
import Organisation from './Organisation';

export default class CharacterOrganisation {
    constructor(
        public role: string | undefined,
        public isPrivate: boolean,
        private readonly organisationId: KankaApiId | undefined,
        private readonly organisationCollection: KankaNodeCollection<Organisation>,
    ) {}

    static fromApiData(
        data: KankaApiCharacterOrganisationLink,
        organisationCollection: KankaNodeCollection<Organisation>,
    ): CharacterOrganisation {
        return new CharacterOrganisation(
            data.role,
            data.is_private,
            data.organisation_id,
            organisationCollection,
        );
    }

    async organisation(): Promise<Organisation | undefined> {
        if (!this.organisationId) return undefined;
        return this.organisationCollection.byId(this.organisationId);
    }
}

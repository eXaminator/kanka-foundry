import api from '..';
import { KankaApiEntity, KankaApiEntityType, KankaApiId, KankaApiOrganisation } from '../../types/kanka';
import type ReferenceCollection from '../ReferenceCollection';
import AbstractTypeLoader from './AbstractTypeLoader';

export default class OrganisationTypeLoader extends AbstractTypeLoader<KankaApiOrganisation> {
    public getType(): KankaApiEntityType {
        return 'organisation';
    }

    public async createReferenceCollection(
        campaignId: KankaApiId,
        entity: KankaApiOrganisation,
        lookup: KankaApiEntity[] = [],
    ): Promise<ReferenceCollection> {
        const collection = await super.createReferenceCollection(campaignId, entity, lookup);

        await Promise.all([
            collection.addById(entity.organisation_id, 'organisation'),
            collection.addById(entity.location_id, 'location'),
            ...entity.members.map(member => collection.addById(member.character_id, 'character')),
        ]);

        return collection;
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiOrganisation> {
        return api.getOrganisation(campaignId, id);
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiOrganisation[]> {
        return api.getAllOrganisations(campaignId);
    }
}

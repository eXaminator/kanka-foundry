import { KankaApiEntity, KankaApiEntityType, KankaApiId, KankaApiOrganisation } from '../../types/kanka';
import api from '../api';
import ReferenceCollection from '../ReferenceCollection';
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
            ...entity.ancestors.map(ancestor => collection.addByEntityId(ancestor)),
            ...entity.members.map(member => collection.addById(member.character_id, 'character')),
            ...entity.children.map(child => collection.addByEntityId(child.entity_id)),
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

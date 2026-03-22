import api from '..';
import type { KankaApiEntity, KankaApiModuleType, KankaApiId, KankaApiOrganisation } from '../../types/kanka';
import type ReferenceCollection from '../ReferenceCollection';
import AbstractTypeLoader from './AbstractTypeLoader';

export default class OrganisationTypeLoader extends AbstractTypeLoader<KankaApiOrganisation> {
    public getType(): KankaApiModuleType {
        return 'organisation';
    }

    public async createReferenceCollection(
        campaignId: KankaApiId,
        entity: KankaApiOrganisation,
        lookup: KankaApiEntity[] = [],
    ): Promise<ReferenceCollection> {
        const collection = await super.createReferenceCollection(campaignId, entity, lookup);

        await Promise.all([
            ...(entity.locations ?? []).map((id) => collection.addById(id, 'location')),
            ...entity.members.map((member) => collection.addById(member.character_id, 'character')),
        ]);

        return collection;
    }

    private normalize(entity: KankaApiOrganisation): KankaApiOrganisation {
        return {
            ...entity,
            locations: entity.locations ?? (entity.location_id ? [entity.location_id] : []),
        };
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiOrganisation> {
        return this.normalize(await api.getOrganisation(campaignId, id));
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiOrganisation[]> {
        return (await api.getAllOrganisations(campaignId)).map((e) => this.normalize(e));
    }
}

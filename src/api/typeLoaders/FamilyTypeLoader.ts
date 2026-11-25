import api from '..';
import type { KankaApiEntity, KankaApiModuleType, KankaApiFamily, KankaApiId } from '../../types/kanka';
import type ReferenceCollection from '../ReferenceCollection';
import AbstractTypeLoader from './AbstractTypeLoader';

export default class FamilyTypeLoader extends AbstractTypeLoader<KankaApiFamily> {
    public getType(): KankaApiModuleType {
        return 'family';
    }

    public async createReferenceCollection(
        campaignId: KankaApiId,
        entity: KankaApiFamily,
        lookup: KankaApiEntity[] = [],
    ): Promise<ReferenceCollection> {
        const collection = await super.createReferenceCollection(campaignId, entity, lookup);

        await Promise.all([
            ...(entity.locations ?? []).map((id) => collection.addById(id, 'location')),
            ...entity.members.map((member) => collection.addById(member, 'character')),
        ]);

        return collection;
    }

    private normalize(entity: KankaApiFamily): KankaApiFamily {
        return {
            ...entity,
            locations: entity.locations ?? (entity.location_id ? [entity.location_id] : []),
        };
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiFamily> {
        return this.normalize(await api.getFamily(campaignId, id));
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiFamily[]> {
        return (await api.getAllFamilies(campaignId)).map((e) => this.normalize(e));
    }
}

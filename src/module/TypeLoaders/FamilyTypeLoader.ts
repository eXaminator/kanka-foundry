import { KankaApiFamily, KankaApiEntity, KankaApiEntityType, KankaApiId } from '../../types/kanka';
import KankaJournalHelper from '../KankaJournalHelper';
import ReferenceCollection from '../ReferenceCollection';
import AbstractTypeLoader from './AbstractTypeLoader';

export default class FamilyTypeLoader extends AbstractTypeLoader<KankaApiFamily> {
    public getType(): KankaApiEntityType {
        return 'family';
    }

    public async createReferenceCollection(
        campaignId: KankaApiId,
        entity: KankaApiFamily,
        lookup: KankaApiEntity[] = [],
    ): Promise<ReferenceCollection> {
        const collection = await super.createReferenceCollection(campaignId, entity, lookup);

        await Promise.all([
            collection.addById(entity.family_id, 'family'),
            ...entity.ancestors.map(ancestor => collection.addByEntityId(ancestor)),
            ...entity.members.map(member => collection.addById(member, 'character')),
        ]);

        return collection;
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiFamily> {
        return this.api.getFamily(campaignId, id);
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiFamily[]> {
        return this.api.getAllFamilies(campaignId);
    }
}

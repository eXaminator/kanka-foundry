import api from '..';
import { KankaApiCharacter, KankaApiEntity, KankaApiEntityType, KankaApiId } from '../../types/kanka';
import type ReferenceCollection from '../ReferenceCollection';
import AbstractTypeLoader from './AbstractTypeLoader';

export default class CharacterTypeLoader extends AbstractTypeLoader<KankaApiCharacter> {
    public getType(): KankaApiEntityType {
        return 'character';
    }

    public async createReferenceCollection(
        campaignId: KankaApiId,
        entity: KankaApiCharacter,
        lookup: KankaApiEntity[] = [],
    ): Promise<ReferenceCollection> {
        const collection = await super.createReferenceCollection(campaignId, entity, lookup);

        await Promise.all([
            collection.addById(entity.location_id, 'location'),
            collection.addById(entity.race_id, 'race'),
            collection.addById(entity.family_id, 'family'),
            ...entity.organisations.data.map(org => collection.addById(org.organisation_id, 'organisation')),
        ]);

        return collection;
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiCharacter> {
        return api.getCharacter(campaignId, id);
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiCharacter[]> {
        return api.getAllCharacters(campaignId);
    }
}

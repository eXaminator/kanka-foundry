import api from '..';
import type { KankaApiCharacter, KankaApiEntity, KankaApiModuleType, KankaApiId } from '../../types/kanka';
import type ReferenceCollection from '../ReferenceCollection';
import AbstractTypeLoader from './AbstractTypeLoader';

export default class CharacterTypeLoader extends AbstractTypeLoader<KankaApiCharacter> {
    public getType(): KankaApiModuleType {
        return 'character';
    }

    public async createReferenceCollection(
        campaignId: KankaApiId,
        entity: KankaApiCharacter,
        lookup: KankaApiEntity[] = [],
    ): Promise<ReferenceCollection> {
        const collection = await super.createReferenceCollection(campaignId, entity, lookup);

        await Promise.all([
            ...(entity.locations ?? []).map((id) => collection.addById(id, 'location')),
            ...(entity.races ?? []).map((id) => collection.addById(id, 'race')),
            ...(entity.private_races ?? []).map((id) => collection.addById(id, 'race')),
            ...(entity.families ?? []).map((id) => collection.addById(id, 'family')),
            ...(entity.private_families ?? []).map((id) => collection.addById(id, 'family')),
            ...entity.organisations.data.map((org) => collection.addById(org.organisation_id, 'organisation')),
        ]);

        return collection;
    }

    private normalize(entity: KankaApiCharacter): KankaApiCharacter {
        const races = entity.races ?? (entity.race_id ? [entity.race_id] : []);
        const families = entity.families ?? (entity.family_id ? [entity.family_id] : []);
        const privateRaces = entity.private_races ?? [];
        const privateFamilies = entity.private_families ?? [];

        // Keep public and private links separate, so private ones can be rendered as secrets
        return {
            ...entity,
            races: races.filter((id) => !privateRaces.includes(id)),
            private_races: privateRaces,
            families: families.filter((id) => !privateFamilies.includes(id)),
            private_families: privateFamilies,
            locations: entity.locations ?? (entity.location_id ? [entity.location_id] : []),
        };
    }

    public async load(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiCharacter> {
        return this.normalize(await api.getCharacter(campaignId, id));
    }

    public async loadAll(campaignId: KankaApiId): Promise<KankaApiCharacter[]> {
        return (await api.getAllCharacters(campaignId)).map((e) => this.normalize(e));
    }
}

import {
    KankaApiAbility,
    KankaApiCampaign,
    KankaApiCharacter,
    KankaApiEntity,
    KankaApiEntityId, KankaApiEvent,
    KankaApiFamily,
    KankaApiId,
    KankaApiItem,
    KankaApiJournal,
    KankaApiListResult,
    KankaApiLocation,
    KankaApiNote,
    KankaApiOrganisation,
    KankaApiQuest,
    KankaApiRace,
    KankaApiResult,
} from '../types/kanka';
import AccessToken from './AccessToken';
import KankaFetcher from './KankaFetcher';
import RateLimiter from './RateLimiter';

export default class KankaApi {
    #fetcher: KankaFetcher;

    public constructor(baseUrl = 'https://kanka.io/api/1.0') {
        this.#fetcher = new KankaFetcher(baseUrl);
    }

    public get isReady(): boolean {
        return Boolean(this.#fetcher.hasToken);
    }

    public get limiter(): RateLimiter {
        return this.#fetcher.limiter;
    }

    public reset(): void {
        this.#fetcher.reset();
    }

    public switchUser(token: AccessToken): void {
        this.reset();
        this.#fetcher.token = token;
    }

    public switchBaseUrl(baseUrl: string): void {
        this.#fetcher.base = baseUrl;
    }

    public get baseUrl(): string {
        return this.#fetcher.base;
    }

    public async getAllCampaigns(): Promise<KankaApiCampaign[]> {
        type Result = KankaApiListResult<KankaApiCampaign>;
        const result = await this.#fetcher.fetch<Result>('campaigns');
        return result.data;
    }

    public async getCampaign(id: number): Promise<KankaApiCampaign> {
        type Result = KankaApiResult<KankaApiCampaign>;
        const result = await this.#fetcher.fetch<Result>(`campaigns/${String(id)}`);
        return result.data;
    }

    public async getCharacter(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiCharacter> {
        type Result = KankaApiResult<KankaApiCharacter>;
        const result = await this.#fetcher.fetch<Result>(`campaigns/${String(campaignId)}/characters/${String(id)}?related=1`);
        return result.data;
    }

    public async getAllCharacters(campaignId: KankaApiId): Promise<KankaApiCharacter[]> {
        return this.fetchFullList<KankaApiCharacter>(
            `campaigns/${Number(campaignId)}/characters?related=1`,
        );
    }

    public async getAbility(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiAbility> {
        const list = await this.getAllAbilities(campaignId);
        const entity = list.find(entity => entity.id === id);
        if (!entity) throw new Error(`Could not find ability with ID '${String(id)}'`);
        return entity;
        /*
        type Result = KankaApiResult<KankaApiAbility>;
        const result = await this.#fetcher
            .fetch<Result>(`campaigns/${String(campaignId)}/abilities/${String(id)}?related=1`);
        return result.data;
         */
    }

    public async getAllAbilities(campaignId: KankaApiId): Promise<KankaApiAbility[]> {
        return this.fetchFullListWithAncestors<KankaApiAbility>(
            `campaigns/${Number(campaignId)}/abilities?related=1`,
            'ability_id',
        );
    }

    public async getFamily(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiFamily> {
        const list = await this.getAllFamilies(campaignId);
        const entity = list.find(entity => entity.id === id);
        if (!entity) throw new Error(`Could not find family with ID '${String(id)}'`);
        return entity;
        /*
        type Result = KankaApiResult<KankaApiFamily>;
        const result = await this.#fetcher
            .fetch<Result>(`campaigns/${String(campaignId)}/families/${String(id)}?related=1`);
        return result.data;
         */
    }

    public async getAllFamilies(campaignId: KankaApiId): Promise<KankaApiFamily[]> {
        return this.fetchFullListWithAncestors<KankaApiFamily>(
            `campaigns/${Number(campaignId)}/families?related=1`,
            'family_id',
        );
    }

    public async getItem(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiItem> {
        const list = await this.getAllItems(campaignId);
        const entity = list.find(entity => entity.id === id);
        if (!entity) throw new Error(`Could not find item with ID '${String(id)}'`);
        return entity;
        /* type Result = KankaApiResult<KankaApiItem>;
        const result = await this.#fetcher
            .fetch<Result>(`campaigns/${String(campaignId)}/items/${String(id)}?related=1`);
        return result.data; */
    }

    public async getAllItems(campaignId: KankaApiId): Promise<KankaApiItem[]> {
        return this.fetchFullListWithAncestors<KankaApiItem>(
            `campaigns/${Number(campaignId)}/items?related=1`,
            'item_id',
        );
    }

    public async getJournal(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiJournal> {
        const list = await this.getAllJournals(campaignId);
        const entity = list.find(entity => entity.id === id);
        if (!entity) throw new Error(`Could not find journal with ID '${String(id)}'`);
        return entity;
        /*
        type Result = KankaApiResult<KankaApiJournal>;
        const result = await this.#fetcher
            .fetch<Result>(`campaigns/${String(campaignId)}/journals/${String(id)}?related=1`);
        return result.data;
         */
    }

    public async getAllJournals(campaignId: KankaApiId): Promise<KankaApiJournal[]> {
        return this.fetchFullListWithAncestors<KankaApiJournal>(
            `campaigns/${Number(campaignId)}/journals?related=1`,
            'journal_id',
        );
    }

    public async getLocation(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiLocation> {
        const list = await this.getAllLocations(campaignId);
        const entity = list.find(entity => entity.id === id);
        if (!entity) throw new Error(`Could not find location with ID '${String(id)}'`);
        return entity;
        /*
        type Result = KankaApiResult<KankaApiLocation>;
        const result = await this.#fetcher
            .fetch<Result>(`campaigns/${String(campaignId)}/locations/${String(id)}?related=1`);
        return result.data;
        */
    }

    public async getAllLocations(campaignId: KankaApiId): Promise<KankaApiLocation[]> {
        return this.fetchFullListWithAncestors(
            `campaigns/${Number(campaignId)}/locations?related=1`,
            'location_id',
            'parent_location_id',
        );
    }

    public async getNote(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiNote> {
        const list = await this.getAllNotes(campaignId);
        const entity = list.find(entity => entity.id === id);
        if (!entity) throw new Error(`Could not find note with ID '${String(id)}'`);
        return entity;
        /*
        type Result = KankaApiResult<KankaApiNote>;
        const result = await this.#fetcher
            .fetch<Result>(`campaigns/${String(campaignId)}/notes/${String(id)}?related=1`);
        return result.data;
         */
    }

    public async getAllNotes(campaignId: KankaApiId): Promise<KankaApiNote[]> {
        return this.fetchFullListWithAncestors<KankaApiNote>(
            `campaigns/${Number(campaignId)}/notes?related=1`,
            'note_id',
        );
    }

    public async getOrganisation(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiOrganisation> {
        const list = await this.getAllOrganisations(campaignId);
        const entity = list.find(entity => entity.id === id);
        if (!entity) throw new Error(`Could not find organisation with ID '${String(id)}'`);
        return entity;
        /*
        type Result = KankaApiResult<KankaApiOrganisation>;
        const result = await this.#fetcher
            .fetch<Result>(`campaigns/${String(campaignId)}/organisations/${String(id)}?related=1`);
        return result.data;
         */
    }

    public async getAllOrganisations(campaignId: KankaApiId): Promise<KankaApiOrganisation[]> {
        return this.fetchFullListWithAncestors<KankaApiOrganisation>(
            `campaigns/${Number(campaignId)}/organisations?related=1`,
            'organisation_id',
        );
    }

    public async getQuest(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiQuest> {
        const list = await this.getAllQuests(campaignId);
        const entity = list.find(entity => entity.id === id);
        if (!entity) throw new Error(`Could not find quest with ID '${String(id)}'`);
        return entity;
        /*
         type Result = KankaApiResult<KankaApiOrganisation>;
         const result = await this.#fetcher
            .fetch<Result>(`campaigns/${String(campaignId)}/quests/${String(id)}?related=1`);
         return result.data;
         */
    }

    public async getAllQuests(campaignId: KankaApiId): Promise<KankaApiQuest[]> {
        return this.fetchFullListWithAncestors<KankaApiQuest>(
            `campaigns/${Number(campaignId)}/quests?related=1`,
            'quest_id',
        );
    }

    public async getRace(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiRace> {
        const list = await this.getAllRaces(campaignId);
        const entity = list.find(entity => entity.id === id);
        if (!entity) throw new Error(`Could not find race with ID '${String(id)}'`);
        return entity;
        /*
        type Result = KankaApiResult<KankaApiRace>;
        const result = await this.#fetcher
            .fetch<Result>(`campaigns/${String(campaignId)}/races/${String(id)}?related=1`);
        return result.data;
        */
    }

    public async getAllRaces(campaignId: KankaApiId): Promise<KankaApiRace[]> {
        return this.fetchFullListWithAncestors<KankaApiRace>(
            `campaigns/${Number(campaignId)}/races?related=1`,
            'race_id',
        );
    }

    public async getEvent(campaignId: KankaApiId, id: KankaApiId): Promise<KankaApiEvent> {
        const list = await this.getAllEvents(campaignId);
        const entity = list.find(entity => entity.id === id);
        if (!entity) throw new Error(`Could not find event with ID '${String(id)}'`);
        return entity;
        /*
        type Result = KankaApiResult<KankaApiEvent>;
        const result = await this.#fetcher
            .fetch<Result>(`campaigns/${String(campaignId)}/events/${String(id)}?related=1`);
        return result.data;
        */
    }

    public async getAllEvents(campaignId: KankaApiId): Promise<KankaApiEvent[]> {
        return this.fetchFullListWithAncestors<KankaApiEvent>(
            `campaigns/${Number(campaignId)}/events?related=1`,
            'event_id',
        );
    }

    public async getEntity(campaignId: KankaApiId, id: KankaApiEntityId): Promise<KankaApiEntity> {
        type Result = KankaApiResult<KankaApiEntity>;
        const result = await this.#fetcher.fetch<Result>(`campaigns/${String(campaignId)}/entities/${String(id)}?image=1`);
        return result.data;
    }

    public async getAllEntities(campaignId: KankaApiId, types: KankaApiEntity['type'][] = []): Promise<KankaApiEntity[]> {
        return this.fetchFullList<KankaApiEntity>(
            `campaigns/${Number(campaignId)}/entities?image=1&types=${types.join(',')}`,
        );
    }

    private async fetchFullList<T>(path: string): Promise<T[]> {
        const data: T[] = [];
        let url: string | null = path;
        const query = (new URL(`https://${path}`)).searchParams.toString();

        while (url) {
            const fullUrl: string = url.includes('?') ? `${url}&${query}` : `${url}?${query}`;
            // eslint-disable-next-line no-await-in-loop
            const result = await this.#fetcher.fetch<KankaApiListResult<T>>(fullUrl);
            data.push(...result.data);
            url = result.links.next;
        }

        return data;
    }

    private async fetchFullListWithAncestors<T>(
        path: string,
        parentProperty: keyof T,
        fallbackProperty?: keyof T,
    ): Promise<T[]> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entities = await this.fetchFullList<T>(path) as any[];

        entities.forEach((entity) => {
            // eslint-disable-next-line no-param-reassign
            entity.ancestors = [];
            let current = entity;
            while (current[parentProperty] ?? current[fallbackProperty]) {
                // eslint-disable-next-line no-loop-func
                const parent = entities.find(e => e.id === (current[parentProperty] ?? current[fallbackProperty]));
                if (!parent) break;
                entity.ancestors.unshift(parent.entity_id);
                current = parent;
            }

            // eslint-disable-next-line no-param-reassign
            entity.children = entities
                .filter(e => entity.id === (e[parentProperty] ?? e[fallbackProperty]))
                .map(e => ({
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    entity_id: e.entity_id,
                    type: e.type,
                }));
        });

        return entities;
    }
}

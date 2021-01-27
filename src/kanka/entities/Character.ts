import EntityType from '../../types/EntityType';
import { KankaApiCharacter } from '../../types/kanka';
import { MetaDataType } from '../../types/KankaSettings';
import mentionLink from '../../util/mentionLink';
import KankaEndpoint from '../KankaEndpoint';
import type Campaign from './Campaign';
import CharacterOrganisation from './CharacterOrganisation';
import Family from './Family';
import Location from './Location';
import PrimaryEntity from './PrimaryEntity';
import Race from './Race';

export default class Character extends PrimaryEntity<KankaApiCharacter> {
    #organisations: CharacterOrganisation[];

    constructor(endpoint: KankaEndpoint, data: KankaApiCharacter, campaign: Campaign) {
        super(endpoint, data, campaign);

        this.#organisations = data.organisations.data
            ?.map(entry => CharacterOrganisation.fromApiData(entry, campaign.organisations())) ?? [];
    }

    get entityType(): EntityType {
        return EntityType.character;
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    public get age(): string | undefined {
        return this.data.age;
    }

    public get isDead(): boolean {
        return this.data.is_dead;
    }

    public get sex(): string | undefined {
        return this.data.sex;
    }

    public get title(): string | undefined {
        return this.data.title;
    }

    public async location(): Promise<Location | undefined> {
        if (!this.data.location_id) return undefined;
        return this.campaign.locations().byId(this.data.location_id);
    }

    public async race(): Promise<Race | undefined> {
        if (!this.data.race_id) return undefined;
        return this.campaign.races().byId(this.data.race_id);
    }

    public async family(): Promise<Family | undefined> {
        if (!this.data.family_id) return undefined;
        return this.campaign.families().byId(this.data.family_id);
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();

        this.addMetaData({ label: 'type', value: this.type });
        this.addMetaData({ label: 'title', value: this.title });
        this.addMetaData({ label: 'sex', value: this.sex });
        this.addMetaData({ label: 'age', value: this.age });
        this.addMetaData({ label: 'isDead', value: this.isDead });

        await Promise.all([
            this.addReferenceMetaData('race', this.race()),
            this.addReferenceMetaData('family', this.family()),
            this.addReferenceMetaData('location', this.location()),
        ]);

        this.data.traits.forEach(trait => this.addMetaData({
            originalData: trait,
            section: trait.section,
            type: MetaDataType.characterTrait,
            label: trait.name,
            value: trait.entry,
        }));

        await this.addOrganisationMetaData();
    }

    protected async addOrganisationMetaData(): Promise<void> {
        const organisations = await Promise.all(this.#organisations.map(i => i.organisation().catch(() => undefined)));

        this.#organisations
            .forEach((reference, index) => {
                const { role } = reference;
                const organisation = organisations[index];
                if (!organisation) return;

                this.addMetaData({
                    label: role || '',
                    type: MetaDataType.characterOrganisation,
                    section: 'organisations',
                    value: mentionLink(organisation.name, organisation),
                    originalData: reference,
                });
            });
    }
}

import EntityType from '../types/EntityType';
import { QuestCharacterData, QuestData, QuestItemData, QuestLocationData, QuestOrganisationData } from '../types/kanka';
import { MetaDataType } from '../types/KankaSettings';
import KankaEntity from './KankaEntity';
import KankaEntityCollection from './KankaEntityCollection';
import QuestCharacter from './QuestCharacter';
import QuestItem from './QuestItem';
import QuestLocation from './QuestLocation';
import QuestOrganisation from './QuestOrganisation';
import QuestReference from './QuestReference';

function referenceValue(reference: QuestReference): string {
    const content: string[] = [];

    if (reference.role) {
        content.push(`<strong class="kanka-quest-role">${reference.role}</strong>`);
    }

    if (reference.description) {
        content.push(reference.description);
    }

    return content.join('<br/>');
}

export default class Quest extends KankaEntity<QuestData> {
    #characters = new KankaEntityCollection(this.api.withPath('quest_characters'), QuestCharacter);
    #locations = new KankaEntityCollection(this.api.withPath('quest_locations'), QuestLocation);
    #items = new KankaEntityCollection(this.api.withPath('quest_items'), QuestItem);
    #organisations = new KankaEntityCollection(this.api.withPath('quest_organisations'), QuestOrganisation);

    get entityType(): EntityType {
        return EntityType.journal;
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    public get date(): string | undefined {
        return this.data.date;
    }

    public get isCompleted(): boolean {
        return this.data.is_completed;
    }

    public get characters(): KankaEntityCollection<QuestCharacter, QuestCharacterData> {
        return this.#characters;
    }

    public get locations(): KankaEntityCollection<QuestLocation, QuestLocationData> {
        return this.#locations;
    }

    public get items(): KankaEntityCollection<QuestItem, QuestItemData> {
        return this.#items;
    }

    public get organisations(): KankaEntityCollection<QuestOrganisation, QuestOrganisationData> {
        return this.#organisations;
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
        this.addMetaData({ label: 'date', value: this.date });
        this.addMetaData({ label: 'isCompleted', value: this.isCompleted });

        await Promise.all([
            this.addReferenceMetaData(this.#characters.all(), 'characters'),
            this.addReferenceMetaData(this.#locations.all(), 'locations'),
            // this.addReferenceMetaData(this.#items.all(), 'items'),
            // this.addReferenceMetaData(this.#organisations.all(), 'organisations'),
        ]);
    }

    private async addReferenceMetaData(referencePromises: Promise<QuestReference[]>, section: string): Promise<void> {
        const references = await referencePromises;
        const entities = await Promise.all(references.map(ref => ref.entity()));

        references.forEach((reference, index) => this.addMetaData({
            label: entities[index].name,
            value: referenceValue(reference),
            section,
            type: MetaDataType.questReference,
            originalData: reference,
            linkTo: entities[index],
        }));
    }
}
